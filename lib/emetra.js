const fetch = require('node-fetch');
const cheerio = require('cheerio');
const url = require('url');

const request = function request(plate, type) {
  const body = `tplaca=${type}&nplaca=${plate}`;
  const req = new Promise((resolveReq, rejectReq) => {
    fetch('http://consulta.muniguate.com/emetra/despliega.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': new Buffer(body).length,
      },
      body,
    })
      .then(res => res.text())
      .then(html => {
        let $ = cheerio.load(html);
        const promises = [];
        $('tr.row').each((i, multa) => {
          const tds = $(multa).find('.texto').toArray();
          const date = $(tds[0]).text();
          const desc = $(tds[1]).text();
          const ammount = $(tds[2]).text();
          const picture = `http://consultas.muniguate.com/consultas/remisiones/remision_pic.jsp?r=${url.parse($(tds[1]).attr('href'), true).query.r}`;
          const result = new Promise((resolve, reject) => {
            fetch(picture, { method: 'GET' })
              .then(res => res.text())
              .then(pictureHtml => {
                $ = cheerio.load(pictureHtml);
                const photo = $("[src*='fotos']").attr('src').replace(/\s+/g, '');
                resolve({
                  date,
                  desc,
                  ammount,
                  photo,
                });
              }).catch(err => {
                reject(err);
              });
          });
          promises.push(result);
        });
        Promise.all(promises).then(data => {
          resolveReq(data);
        });
      }).catch(e => {
        rejectReq(e);
      });
  });
  return req;
};

module.exports = request;

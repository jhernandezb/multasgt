const fetch = require('node-fetch');
const cheerio = require('cheerio');

const parsePlace = function parsePlace(nodeEl) {
  const elements = cheerio(nodeEl).find('h6');
  return elements.eq(1).text().trim();
};

const parseDate = function parseDate(nodeEl) {
  const elements = cheerio(nodeEl).find('h6');
  return elements.eq(1).text();
};

const parseInfo = function parseInfo(nodeEl) {
  const elements = cheerio(nodeEl).find('h6');
  return {
    id: elements.eq(0).text(),
    ammount: elements.eq(1).text(),
    interest: elements.eq(2).text(),
  };
};

const parseAdditionalInfo = function parseAdditionalInfo(nodeEl) {
  const elements = cheerio(nodeEl).find('h6');
  return {
    reason: elements.eq(0).text(),
    discount: elements.eq(1).text(),
    total: elements.eq(2).text(),
  };
};

const request = function request(plate, type) {
  const body = `tPlaca=${type}&placa=${plate}&estado=0`;

  const req = new Promise((resolveReq, rejectReq) => {
    fetch('http://consultas.munimixco.gob.gt/vista/emixtra.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': new Buffer(body).length,
      },
      body,
    })
      .then(res => res.text())
      .then(html => {
        const $ = cheerio.load(html);
        let status = 0;
        let current = {};
        let results = [];
        $('#foo').children().each((i, child) => {
          if (child.type === 'tag' && (child.name === 'div' || child.name === 'hr')) {
            if (child.name === 'hr') {
              status = 0;
              current = {};
            } else {
              switch (status) {
                case 0:
                  current.place = parsePlace(child);
                  break;
                case 1:
                  current.date = parseDate(child);
                  break;
                case 3:
                  current = Object.assign({}, current, parseInfo(child));
                  current.photo = `http://consultas.munimixco.gob.gt/vista/views/foto.php?rem=${current.id}&T=${type}&P=${plate}&s=F`;
                  break;
                case 5:
                  current = Object.assign({}, current, parseAdditionalInfo(child));
                  break;
                case 7:
                  results = [...results, current];
                  break;
                case 2:
                case 4:
                case 6:
                default:
                  break;
              }
              status++;
            }
          }
        });
        resolveReq(results);
      }).catch(e => {
        rejectReq(e);
      });
  });
  return req;
};

module.exports = request;

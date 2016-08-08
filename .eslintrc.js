const OFF = 0;
const WARNING = 1;
const ERROR = 2;
function getConfig(){
  return {
    extends: 'airbnb',
    parserOptions: {
      ecmaVersion: 6,
      sourceType: 'module'
    },
    ecmaFeautres : {
      modules : true
    },
    env : {
      node : true
    },
    rules : {

    }
  }
}

var config  = getConfig();

module.exports = config;

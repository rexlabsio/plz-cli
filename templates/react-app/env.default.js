/*
|-------------------------------------------------------------------------------
| Development / Production Variables
|-------------------------------------------------------------------------------
|
| Values in this file can be access by the `src/config` module. It can resolve
| dev-only variables, by accessing option duplicated variables under a `dev` key.
|
*/

module.exports = {
  API_URL: 'http://127.0.0.1:8000/api/v1',

  dev: {
    // API_URL: 'http://localhost:8001/api/v1',
  }
};

export default class Browser {
  static saveToken(token) {
    sessionStorage.setItem('token', token); 
  }

  static getToken() {
    return sessionStorage.getItem('token');
  }

  static logout() {
    sessionStorage.removeItem('token');
  }
}


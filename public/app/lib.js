export function generateUid() {
    return Math.random().toString(36).substring(2, 22);
}

export const baseUrl = 'http://localhost:3000';

export function removeByKey (myObj, deleteKey) {
  return Object.keys(myObj)
    .filter(key => key !== deleteKey)
    .reduce((result, current) => {
      result[current] = myObj[current];
      return result;
  }, {});
}

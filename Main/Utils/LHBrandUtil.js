function getIndexName(name) {
  const indexName = name.toUpperCase().replace(' ', '').replace('\t', '');
  return indexName;
}

function group(list, prop) {
  let key = {};
  const result = {};
  list.forEach((t) => {
    key = t[prop];
    if (result[key]) {
      result[key].push(t);
    } else {
      result[key] = [t];
    }
  });
  return result;
}

export default {
  getIndexName,
  group
};

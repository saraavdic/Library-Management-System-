const fs = require('fs');
const path = require('path');

function parseTuples(valuesBlock) {
  const tuples = [];
  let i = 0;
  while (i < valuesBlock.length) {
    while (i < valuesBlock.length && valuesBlock[i] !== '(') i++;
    if (i >= valuesBlock.length) break;
    let start = i + 1;
    let depth = 1;
    i = start;
    while (i < valuesBlock.length && depth > 0) {
      if (valuesBlock[i] === '(') depth++;
      else if (valuesBlock[i] === ')') depth--;
      i++;
    }
    const tuple = valuesBlock.slice(start, i - 1).trim();
    tuples.push(tuple);
  }
  return tuples;
}

function parseValues(tupleStr) {
  const values = [];
  let i = 0;
  const len = tupleStr.length;
  while (i < len) {
    while (i < len && /[\s]/.test(tupleStr[i])) i++;
    if (i >= len) break;
    if (tupleStr[i] === "'") {
      // quoted string, handle doubled '' as escaped quote
      i++;
      let buf = '';
      while (i < len) {
        if (tupleStr[i] === "'") {
          if (tupleStr[i + 1] === "'") { buf += "'"; i += 2; continue; }
          i++; break; // end string
        }
        buf += tupleStr[i++];
      }
      values.push(buf);
      while (i < len && tupleStr[i] !== ',') i++;
      if (tupleStr[i] === ',') i++;
    } else {
      // unquoted (NULL or number)
      let start = i;
      while (i < len && tupleStr[i] !== ',') i++;
      let token = tupleStr.slice(start, i).trim();
      if (token.toUpperCase() === 'NULL') values.push(null);
      else if (/^[0-9.+-]+$/.test(token)) values.push(Number(token));
      else values.push(token.replace(/^"|"$/g, ''));
      if (tupleStr[i] === ',') i++;
    }
  }
  return values;
}

function parseInsertBlock(block, tableName) {
  const pattern = 'INSERT INTO `' + tableName + '`\\s*\\(([^)]+)\\)\\s*VALUES\\s*(.+);';
  const m = block.match(new RegExp(pattern, 'is'));
  if (!m) return [];
  const colsRaw = m[1];
  const valuesBlock = m[2];
  const cols = colsRaw.split(',').map(s => s.replace(/[`"\s]/g, '').trim());
  const tuples = parseTuples(valuesBlock);
  const rows = tuples.map(t => {
    const vals = parseValues(t);
    const obj = {};
    for (let i = 0; i < cols.length; i++) obj[cols[i]] = vals[i] !== undefined ? vals[i] : null;
    return obj;
  });
  return rows;
}

function loadSqlFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf8');
    
    // Try multiple paths
    const home = require('os').homedir();
    const paths = [
      process.env.SQL_DUMP_PATH,
      path.join(home, 'Downloads', 'library.sql'),
      path.join(home, 'Downloads', 'library (1).sql'),
    ];
    
    for (const p of paths) {
      if (p && fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf8');
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

function getUsersFromSql(filePath) {
  const sql = loadSqlFile(filePath);
  if (!sql) return [];
  const rows = parseInsertBlock(sql, 'users');
  return rows.map(r => ({
    id: r.user_id,
    email: r.email,
    first_name: r.first_name,
    last_name: r.last_name,
    name: ((r.first_name || '') + ' ' + (r.last_name || '')).trim(),
    created_at: r.created_at,
  }));
}

function getBooksFromSql(filePath) {
  const sql = loadSqlFile(filePath);
  if (!sql) return [];
  const rows = parseInsertBlock(sql, 'books');
  return rows.map(r => ({
    id: r.book_id,
    title: r.title,
    description: r.description,
    published_year: r.published_year,
    isbn: r.isbn,
    category_id: r.category_id,
    publisher_id: r.publisher_id,
    total_copies: r.total_copies,
    cover: r.cover_image_url
  }));
}

function getFinesFromSql(filePath) {
  const sql = loadSqlFile(filePath);
  if (!sql) return [];
  const rows = parseInsertBlock(sql, 'fines');
  return rows.map(r => ({
    id: r.id,
    member_name: r.member_name,
    amount: r.amount,
    type: r.type,
    status: r.status
  }));
}

module.exports = { getUsersFromSql, getBooksFromSql, getFinesFromSql };

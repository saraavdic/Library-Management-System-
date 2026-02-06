const Members = require('../models/members');

async function main(){
  try{
    const rows = await Members.getAll(100);
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  }catch(e){
    console.error('Error:', e);
    process.exit(1);
  }
}

main();

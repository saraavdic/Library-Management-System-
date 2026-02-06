const Fines = require('../models/fines');
const Membership = require('../models/membership');

async function main(){
  try{
    const limit = 100;
    const fines = await Fines.getAll(limit);
    const membershipPayments = await Membership.getAllMembershipPayments(limit);

    const mappedFines = fines.map(f => ({
      id: f.id || f.payment_id,
      member_name: f.member_name,
      amount: f.amount,
      type: 'fine',
      status: f.paid_status || (f.status === 'paid' ? 'paid' : 'not paid'),
      date: f.fine_created_date || f.fine_paid_date || null
    }));

    const mappedMemberships = membershipPayments.map(mp => ({
      id: mp.payment_id,
      member_name: `${mp.first_name || ''} ${mp.last_name || ''}`.trim(),
      amount: mp.amount,
      type: 'membership',
      status: 'paid',
      date: mp.payment_date || mp.period_start
    }));

    const combined = mappedFines.concat(mappedMemberships).sort((a,b)=>{
      const aT = a.date ? new Date(a.date).getTime() : 0;
      const bT = b.date ? new Date(b.date).getTime() : 0;
      return bT - aT;
    });

    console.log(JSON.stringify(combined.slice(0,50), null, 2));
    process.exit(0);
  }catch(e){
    console.error(e);
    process.exit(1);
  }
}

main();

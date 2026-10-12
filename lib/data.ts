import { Asset, Liability } from './types'

export const DEFAULT_ASSETS: Omit<Asset, 'id'>[] = [
  { cls:'realestate', name:'Recoletos',       cur:'EUR', val:520000, cost:370000, inc:76700,  inc_monthly:3000, risk:3, tgt:14.7, is_active:true  },
  { cls:'realestate', name:'Atipik',          cur:'EUR', val:118000, cost:0,      inc:19621,  inc_monthly:0,    risk:3, tgt:12.0, is_active:true  },
  { cls:'realestate', name:'Barbieri 19',     cur:'EUR', val:330000, cost:330000, inc:39930,  inc_monthly:2250, risk:2, tgt:12.1, is_active:true  },
  { cls:'realestate', name:'Carmon',          cur:'EUR', val:66500,  cost:0,      inc:10972,  inc_monthly:0,    risk:3, tgt:16.5, is_active:true  },
  { cls:'realestate', name:'Alzira',          cur:'EUR', val:4600,   cost:0,      inc:0,      inc_monthly:0,    risk:4, tgt:0,    is_active:false },
  { cls:'financial',  name:'Andbank cartera', cur:'EUR', val:267926, cost:0,      inc:0,      inc_monthly:0,    risk:2, tgt:0,    is_active:true  },
  { cls:'financial',  name:'USA Pershing',    cur:'USD', val:198730, cost:0,      inc:0,      inc_monthly:0,    risk:2, tgt:0,    is_active:true  },
  { cls:'financial',  name:'USA 2',           cur:'USD', val:40425,  cost:0,      inc:0,      inc_monthly:0,    risk:2, tgt:0,    is_active:true  },
  { cls:'financial',  name:'Degiro',          cur:'EUR', val:0,      cost:0,      inc:0,      inc_monthly:0,    risk:2, tgt:0,    is_active:false },
  { cls:'alternative',name:'Arte CaroBouzo',  cur:'EUR', val:23768,  cost:0,      inc:0,      inc_monthly:0,    risk:4, tgt:0,    is_active:true  },
  { cls:'alternative',name:'Private Equity',  cur:'EUR', val:14250,  cost:0,      inc:0,      inc_monthly:0,    risk:5, tgt:0,    is_active:true  },
  { cls:'cash',       name:'Andbank efectivo',cur:'EUR', val:233000, cost:0,      inc:0,      inc_monthly:0,    risk:1, tgt:0,    is_active:true  },
  { cls:'cash',       name:'Blueberry Capital',cur:'EUR',val:15000,  cost:0,      inc:0,      inc_monthly:0,    risk:1, tgt:0,    is_active:true  },
  { cls:'cash',       name:'Santander Caro',  cur:'EUR', val:17094,  cost:0,      inc:0,      inc_monthly:0,    risk:1, tgt:0,    is_active:true  },
  { cls:'cash',       name:'Bancos individuos',cur:'EUR',val:1000,   cost:0,      inc:0,      inc_monthly:0,    risk:1, tgt:0,    is_active:true  },
]

export const DEFAULT_LIABILITIES: Omit<Liability, 'id'>[] = [
  { name:'Hipoteca Recoletos',  tipo:'hipoteca',      bal:169374, rate:2.5, linked:'Recoletos',   monthly:670 },
  { name:'Pignorado Andbank',   tipo:'pignorado',     bal:125000, rate:4.0, linked:'Barbieri 19', monthly:400 },
  { name:'IS 2025 BBC',         tipo:'provision',     bal:22500,  rate:0,   linked:'',            monthly:0   },
  { name:'Pagos 6 meses',       tipo:'workingcapital',bal:42000,  rate:0,   linked:'',            monthly:0   },
]

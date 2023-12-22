const jsonOutput = { cv: { type: 'FlipFlop', name: 'cv', inputs: ['qx', 'rz'], outputs: ['xz'], state: false }, kt: { type: 'FlipFlop', name: 'kt', inputs: ['cb'], outputs: ['qx', 'rz'], state: false }, cb: { type: 'FlipFlop', name: 'cb', inputs: ['qx', 'qp'], outputs: ['kt'], state: false }, pl: { type: 'FlipFlop', name: 'pl', inputs: ['ff'], outputs: ['sf', 'db'], state: false }, zd: { type: 'FlipFlop', name: 'zd', inputs: ['fj'], outputs: ['ln', 'gf'], state: false }, bf: { type: 'FlipFlop', name: 'bf', inputs: ['cl'], outputs: ['qx', 'pf'], state: false }, xz: { type: 'FlipFlop', name: 'xz', inputs: ['cv', 'qx'], outputs: ['jd'], state: false }, xm: { type: 'FlipFlop', name: 'xm', inputs: ['qj'], outputs: ['db'], state: false }, vz: { type: 'FlipFlop', name: 'vz', inputs: ['ks'], outputs: ['cr', 'vc'], state: false }, qq: { type: 'FlipFlop', name: 'qq', inputs: ['ln'], outputs: ['qm', 'gf'], state: false }, xn: { type: 'Conjunction', name: 'xn', inputs: ['gf'], outputs: ['th'], inputSignals: { gf: 'low' } }, nn: { type: 'FlipFlop', name: 'nn', inputs: ['cc'], outputs: ['ff', 'db'], state: false }, gx: { type: 'FlipFlop', name: 'gx', inputs: ['cr', 'vc'], outputs: ['cd'], state: false }, qn: { type: 'Conjunction', name: 'qn', inputs: ['vc'], outputs: ['th'], inputSignals: { vc: 'low' } }, qk: { type: 'FlipFlop', name: 'qk', inputs: ['pm'], outputs: ['vc'], state: false }, xf: { type: 'Conjunction', name: 'xf', inputs: ['db'], outputs: ['th'], inputSignals: { db: 'low' } }, qj: { type: 'FlipFlop', name: 'qj', inputs: ['jz'], outputs: ['xm', 'db'], state: false }, fn: { type: 'FlipFlop', name: 'fn', inputs: ['lc'], outputs: ['pr', 'gf'], state: false }, sf: { type: 'FlipFlop', name: 'sf', inputs: ['pl', 'db'], outputs: ['bp'], state: false }, jd: { type: 'FlipFlop', name: 'jd', inputs: ['xz'], outputs: ['qx', 'vm'], state: false }, mc: { type: 'FlipFlop', name: 'mc', inputs: ['ch'], outputs: ['ds', 'db'], state: false }, tj: { type: 'FlipFlop', name: 'tj', inputs: ['gm'], outputs: ['lc', 'gf'], state: false }, jz: { type: 'FlipFlop', name: 'jz', inputs: ['bp'], outputs: ['qj', 'db'], state: false }, sb: { type: 'FlipFlop', name: 'sb', inputs: ['lr'], outputs: ['ks', 'vc'], state: false }, ln: { type: 'FlipFlop', name: 'ln', inputs: ['zd'], outputs: ['gf', 'qq'], state: false }, bx: { type: 'FlipFlop', name: 'bx', inputs: ['broadcaster', 'qx'], outputs: ['qx', 'qp'], state: false }, broadcaster: { type: 'Broadcaster', name: 'broadcaster', inputs: [], outputs: ['sr', 'ch', 'hd', 'bx'] }, ch: { type: 'FlipFlop', name: 'ch', inputs: ['broadcaster', 'db'], outputs: ['db', 'mc'], state: false }, ds: { type: 'FlipFlop', name: 'ds', inputs: ['mc', 'db'], outputs: ['cc'], state: false }, qx: { type: 'Conjunction', name: 'qx', inputs: ['kt', 'bf', 'jd', 'bx', 'cl', 'qp', 'pf', 'rz'], outputs: ['cb', 'cv', 'bx', 'xz', 'vm', 'zl'], inputSignals: { kt: 'low', bf: 'low', jd: 'low', bx: 'low', cl: 'low', qp: 'low', pf: 'low', rz: 'low' } }, bp: { type: 'FlipFlop', name: 'bp', inputs: ['sf'], outputs: ['db', 'jz'], state: false }, zl: { type: 'Conjunction', name: 'zl', inputs: ['qx'], outputs: ['th'], inputSignals: { qx: 'low' } }, vl: { type: 'FlipFlop', name: 'vl', inputs: ['sr'], outputs: ['gf', 'fj'], state: false }, db: { type: 'Conjunction', name: 'db', inputs: ['pl', 'xm', 'nn', 'qj', 'mc', 'jz', 'ch', 'bp'], outputs: ['ff', 'ds', 'sf', 'ch', 'cc', 'xf'], inputSignals: { pl: 'low', xm: 'low', nn: 'low', qj: 'low', mc: 'low', jz: 'low', ch: 'low', bp: 'low' } }, th: { type: 'Conjunction', name: 'th', inputs: ['xn', 'qn', 'xf', 'zl'], outputs: ['rx'], inputSignals: { xn: 'low', qn: 'low', xf: 'low', zl: 'low' } }, cr: { type: 'FlipFlop', name: 'cr', inputs: ['vz'], outputs: ['gx', 'vc'], state: false }, sr: { type: 'FlipFlop', name: 'sr', inputs: ['broadcaster', 'gf'], outputs: ['gf', 'vl'], state: false }, lr: { type: 'FlipFlop', name: 'lr', inputs: ['hv', 'vc'], outputs: ['sb'], state: false }, hv: { type: 'FlipFlop', name: 'hv', inputs: ['vc', 'nh'], outputs: ['lr'], state: false }, cl: { type: 'FlipFlop', name: 'cl', inputs: ['vm'], outputs: ['qx', 'bf'], state: false }, lc: { type: 'FlipFlop', name: 'lc', inputs: ['tj'], outputs: ['gf', 'fn'], state: false }, pm: { type: 'FlipFlop', name: 'pm', inputs: ['cd'], outputs: ['vc', 'qk'], state: false }, cc: { type: 'FlipFlop', name: 'cc', inputs: ['ds', 'db'], outputs: ['nn'], state: false }, gm: { type: 'FlipFlop', name: 'gm', inputs: ['qm'], outputs: ['tj', 'gf'], state: false }, vm: { type: 'FlipFlop', name: 'vm', inputs: ['jd', 'qx'], outputs: ['cl'], state: false }, ff: { type: 'FlipFlop', name: 'ff', inputs: ['nn', 'db'], outputs: ['pl'], state: false }, qp: { type: 'FlipFlop', name: 'qp', inputs: ['bx'], outputs: ['cb', 'qx'], state: false }, pf: { type: 'FlipFlop', name: 'pf', inputs: ['bf'], outputs: ['qx'], state: false }, vc: { type: 'Conjunction', name: 'vc', inputs: ['vz', 'qk', 'sb', 'cr', 'pm', 'cd', 'hd'], outputs: ['lr', 'hd', 'ks', 'qn', 'gx', 'nh', 'hv'], inputSignals: { vz: 'low', qk: 'low', sb: 'low', cr: 'low', pm: 'low', cd: 'low', hd: 'low' } }, qm: { type: 'FlipFlop', name: 'qm', inputs: ['qq', 'gf'], outputs: ['gm'], state: false }, nh: { type: 'FlipFlop', name: 'nh', inputs: ['vc', 'hd'], outputs: ['hv'], state: false }, rz: { type: 'FlipFlop', name: 'rz', inputs: ['kt'], outputs: ['qx', 'cv'], state: false }, ks: { type: 'FlipFlop', name: 'ks', inputs: ['sb', 'vc'], outputs: ['vz'], state: false }, fj: { type: 'FlipFlop', name: 'fj', inputs: ['vl', 'gf'], outputs: ['zd'], state: false }, gf: { type: 'Conjunction', name: 'gf', inputs: ['zd', 'qq', 'fn', 'tj', 'ln', 'vl', 'sr', 'lc', 'gm', 'pr'], outputs: ['fj', 'qm', 'xn', 'sr'], inputSignals: { zd: 'low', qq: 'low', fn: 'low', tj: 'low', ln: 'low', vl: 'low', sr: 'low', lc: 'low', gm: 'low', pr: 'low' } }, pr: { type: 'FlipFlop', name: 'pr', inputs: ['fn'], outputs: ['gf'], state: false }, cd: { type: 'FlipFlop', name: 'cd', inputs: ['gx'], outputs: ['pm', 'vc'], state: false }, hd: { type: 'FlipFlop', name: 'hd', inputs: ['broadcaster', 'vc'], outputs: ['vc', 'nh'], state: false } }
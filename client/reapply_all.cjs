const { execSync } = require('child_process');

try {
  console.log(execSync('node add_subsystem_layer.cjs').toString());
} catch(e) { console.log(e.message); }

try {
  console.log(execSync('node add_real_subsystem_layer.cjs').toString());
} catch(e) { console.log(e.message); }

try {
  console.log(execSync('node fix_back_btn.cjs').toString());
} catch(e) { console.log(e.message); }

try {
  console.log(execSync('node fix_ts.cjs').toString());
} catch(e) { console.log(e.message); }

try {
  console.log(execSync('node fix_glow.cjs').toString());
} catch(e) { console.log(e.message); }

try {
  console.log(execSync('node hide_mcqs_for_tahdedat.cjs').toString());
} catch(e) { console.log(e.message); }

try {
  console.log(execSync('node update_hemonc.cjs').toString());
} catch(e) { console.log(e.message); }


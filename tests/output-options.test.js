const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'dazrenderqueue.dsa'), 'utf8');
new vm.Script(source); // Check the full script's JavaScript syntax.
const helpers = source.split('// OUTPUT HELPERS BEGIN')[1].split('\n').slice(1).join('\n').split('// OUTPUT HELPERS END')[0];
const api = vm.createContext({});
vm.runInContext(helpers, api);
let checks = 0;
function equal(actual, expected) { assert.equal(actual, expected); checks++; }
function valid(job) { equal(api.outputError(job), ''); }
function invalid(job) { assert.ok(api.outputError(job)); checks++; }
const legacy = {path: 'C:/Scenes/My Scene.duf', cam: '', override: false};

equal(api.outputRelativePath(legacy, 'Camera', 1, 1, 0), 'My Scene.png');
equal(api.outputRelativePath({...legacy, path: 'C:\\Scenes\\My Scene.duf'}, 'Camera', 1, 1, 0), 'My Scene.png');
for (const format of ['png', 'jpg', 'tif', 'bmp']) {
    const job = {...legacy, outputName: 'Portrait Final', outputFormat: format};
    valid(job);
    equal(api.outputRelativePath(job, 'Camera', 1, 1, 0), 'Portrait Final.' + format);
    // Saved queues round-trip their custom output settings.
    equal(api.outputRelativePath(JSON.parse(JSON.stringify(job)), 'Camera', 1, 1, 0), 'Portrait Final.' + format);
}
equal(api.outputRelativePath({...legacy, outputName: 'Walk', outputFormat: 'jpg'}, 'Cam', 1, 2, 7), 'Walk/Walk_Frame0007.jpg');
equal(api.outputRelativePath({...legacy, cam: 'ALL', outputName: 'Walk', outputFormat: 'tif'}, 'Front_Camera', 2, 2, 7), 'Walk/Front_Camera/Walk_Front_Camera_Frame0007.tif');
equal(api.outputRelativePath({...legacy, cam: 'ALL'}, 'Front', 2, 1, 0), 'My Scene_Front.png');
equal(api.outputRelativePath(legacy, 'Cam', 1, 2, 10000), 'My Scene/My Scene_Frame10000.png');
equal(api.outputRelativePath(legacy, 'Cam', 1, 2, -2), 'My Scene/My Scene_Frame-0002.png');
equal(api.normalizeOutputName(' Portrait.JPEG '), 'Portrait');
equal(api.normalizeOutputName('Portrait.tiff'), 'Portrait');
equal(api.normalizeOutputName('Portrait.v2'), 'Portrait.v2');
valid({...legacy, outputName: 'Été – 東京 (final).v2'});
for (const name of ['../outside', '..\\outside', 'C:\\escape', 'bad:name', 'bad?name', 'bad*name', 'bad|name', 'bad"name', 'bad<name', 'bad>name', 'bad\x00name', 'bad\x1fname', '.', '..', 'name.', 'name ', 'CON', 'nul.txt', 'lPt1', 'COM9', 'COM¹', 'LPT²', 'x'.repeat(201)]) {
    invalid({...legacy, outputName: name});
}
invalid({...legacy, outputFormat: 'exe'});
equal(api.queueOutputError([legacy]), '');
assert.match(api.queueOutputError([legacy, {...legacy, path: 'C:/Other/my scene.duf'}]), /same output name/); checks++;
equal(api.queueOutputError([legacy, {...legacy, outputFormat: 'jpg'}]), '');
equal(api.queueOutputError([legacy, {...legacy, outputName: 'Alternate'}]), '');
const owners = {};
equal(api.claimOutput(owners, 'Portrait_Front.jpg', '0/0/0'), true);
equal(api.claimOutput(owners, 'portrait_front.JPG', '1/0/0'), false);
equal(api.claimOutput(owners, 'Portrait_Front.jpg', '0/0/0'), true);
equal(api.claimOutput(owners, 'Portrait_Front.png', '1/0/0'), true);
console.log(`${checks} output naming, format, compatibility, and validation checks passed.`);

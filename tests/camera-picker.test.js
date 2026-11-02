const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'dazrenderqueue.dsa'), 'utf8');
new vm.Script(source);
function block(name) {
    return source.split(`// ${name} HELPERS BEGIN`)[1].split('\n').slice(1).join('\n').split(`// ${name} HELPERS END`)[0];
}
const api = vm.createContext({});
vm.runInContext(block('OUTPUT') + '\n' + block('CAMERA'), api);
let checks = 0;
function eq(actual, expected) {
    assert.deepEqual(JSON.parse(JSON.stringify(actual)), expected);
    checks++;
}
const scene = {
    node_library: [
        {id: 'Cam 1', name: 'Camera1', label: 'Definition label', type: 'camera'},
        {id: 'Cam2', name: 'Camera2', label: 'Same label', type: 'camera'},
        {id: 'unused', name: 'Unused camera', label: 'Unused', type: 'camera'},
        {id: 'mesh', name: 'Figure', type: 'figure'}
    ],
    scene: {nodes: [
        {id: 'cam-1', url: '#Cam%201', name: 'ActualCamera', label: 'Same label'},
        {id: 'cam-2', url: '#Cam2'},
        {id: 'figure', url: '#mesh'}
    ]}
};
function scan(doc, extra = {}) {
    return api.collectSceneCameras(doc, '/scene.duf', f => {
        if (!extra[f]) throw new Error('Missing asset');
        return extra[f];
    }, f => f);
}
let result = scan(scene);
eq(result.warnings, []);
eq(result.cameras.map(x => [x.name, x.label]), [['ActualCamera', 'Same label'], ['Camera2', 'Same label']]);
let choices = api.cameraChoices(result, {cam:'ActualCamera'});
eq(choices.selected, 2);
eq(choices.items.slice(0,2).map(x=>x.label), ['Saved active camera','All cameras']);
assert.notEqual(choices.items[2].label, choices.items[3].label); checks++;
eq(api.cameraChoices(result, {cam:''}).selected, 0);
eq(api.cameraChoices(result, {cam:'ALL'}).selected, 1);
const missing = api.cameraChoices(result, {cam:'Deleted',camLabel:'Previous camera',camMode:'named'});
eq(missing.items[missing.selected].name, 'Deleted');
assert.match(missing.items[missing.selected].label,/not found/); checks++;
eq(api.cameraChoices(scan({scene:{nodes:[]}}), {cam:''}).items.length, 2);
eq(scan({node_library:scene.node_library}).cameras.length, 0);

const external = {scene:{nodes:[{id:'external',url:'/camera.dsf#derived',label:'Été 東京'}]}};
result = scan(external, {
    '/camera.dsf':{node_library:[{id:'derived',source:'/base.dsf#base',name:'InternalName'}]},
    '/base.dsf':{node_library:[{id:'base',type:'camera',name:'Base',label:'Base label'}]}
});
eq(result.cameras.map(x=>[x.name,x.label]), [['InternalName','Été 東京']]);
eq(result.warnings, []);
eq(scan(external).cameras, []);
eq(scan(external).warnings.length, 1);
const cycle = {node_library:[{id:'a',source:'#b'},{id:'b',source:'#a'}],scene:{nodes:[{id:'cyclic',url:'#a'}]}};
eq(scan(cycle).cameras, []);
assert.match(scan(cycle).warnings[0], /Circular/); checks++;
eq(api.dsonReference('camera:/data/My%20Camera.dsf#Cam%201'), {file:'/data/My Camera.dsf',id:'Cam 1'});
eq(api.dsonReference('camera:#id'), {file:'',id:'id'});
eq(api.dsonReference('C:/Cameras/camera.dsf#id'), {file:'C:/Cameras/camera.dsf',id:'id'});
eq(api.dsonReference('file:///C:/Cameras/camera.dsf#id'), {file:'C:/Cameras/camera.dsf',id:'id'});
assert.throws(()=>api.dsonReference('https://example.com/file.dsf#camera')); checks++;
assert.throws(()=>api.dsonReference('ftp://example.com/file.dsf#camera')); checks++;
assert.throws(()=>api.dsonReference('//example.com/file.dsf#camera')); checks++;
assert.throws(()=>api.dsonReference('#bad%escape')); checks++;
eq(api.cameraChoices({cameras:[{name:'Cam',label:'All cameras',id:'a'}]}, {cam:'Cam',camLabel:'Old label'}).selected,2);
eq(api.cameraChoices({cameras:[{name:'Cam',label:'All cameras',id:'a'}]}, {cam:'Cam'}).items[2].label,'All cameras (scene camera)');
eq(scan({node_library:[{id:'cam',name:'Camera',type:'camera',source:'/missing.dsf#old'}],scene:{nodes:[{id:'cam-instance',url:'#cam'}]}}).cameras.length,1);

const runtimeCameras=[{name:'ActualCamera',label:'Same label'},{name:'Camera2',label:'Same label'}];
eq(api.selectedCameraIndex(runtimeCameras,{cam:'ActualCamera'}),0);
eq(api.selectedCameraIndex(runtimeCameras,{cam:'Camera2',camLabel:'Same label'}),1);
eq(api.selectedCameraIndex(runtimeCameras,{cam:'Missing'}),-1);
const duplicateNames=[{name:'Camera',label:'Front'},{name:'Camera',label:'Back'}];
eq(api.selectedCameraIndex(duplicateNames,{cam:'Camera',camLabel:'Back'}),1);
eq(api.selectedCameraIndex(duplicateNames,{cam:'Camera'}),-2);
eq(api.selectedCameraIndex([{name:'Camera',label:'Same'},{name:'Camera',label:'Same'}],{cam:'Camera',camLabel:'Same'}),-2);
const allNamed={cam:'ALL',camMode:'named',outputName:'Portrait',path:'test.duf'};
eq(api.outputRelativePath(allNamed,'Camera',2,1,0),'Portrait.png');

// Exercise synthetic saved-scene metadata; selection must use the
// internal Camera 1 name even though the UI shows Back Perspective Cam.
const fixture = JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/cameras.json'),'utf8'));
result = scan(fixture);
eq(result.cameras.length, 4);
eq(result.warnings, []);
eq(result.cameras.find(x=>x.label==='Back Perspective Cam').name,'Camera 1');
console.log(`${checks} camera metadata, selection, compatibility, and error handling checks passed.`);

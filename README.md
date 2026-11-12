# DazRenderQueue

A simple, lightweight batch rendering script for DAZ Studio that automatically renders multiple scenes in sequence. 

## How to install/remove the script:

Put the script in one of your content library folders. In Daz, go to the Content Library and find the script, then right-click it and select Create Custom Script. For Root, select scripts and then accept. Now, in the top toolbar under Scripts, you should see the Render Queue script, and from there you can open the UI.

If you want to remove it, go to Windows > Workspace > Customize. In the text filter, search for the script name once in Actions and once in Menus, and delete it from both.


## How to Use
Load the script into DAZ Studio, select your render output directory, and click **+ ADD SCENES** to queue your saved `.duf` files. Double-click a queue item to configure:

- **Output filename:** leave blank to use the scene filename. The selected extension is added automatically.
- **File type:** PNG, JPEG, TIFF, or BMP. JPEG does not preserve transparency.
- **Camera:** choose a camera read from the saved scene, **Saved active camera**, or **All cameras**.
- **Render Saved Animation Range:** renders every frame in your timeline range.

Click **START RENDER QUEUE** when ready. Render settings are parsed from each scene.

Animation and multi-camera batches add frame/camera suffixes. Existing nonempty output files are skipped for resume, so use a new filename or output folder for another version. Invalid Windows filenames and duplicate output names are rejected. JPEG quality and TIFF bit depth use DAZ's image-writer defaults.

<img width="752" height="682" alt="image" src="https://github.com/user-attachments/assets/474ca0ae-4440-491f-bab3-cc8b8adfed37" />
<br><br>
<img width="749" height="274" alt="image" src="https://github.com/user-attachments/assets/80f0a8de-f3c5-49cd-926a-c05d5e1646f7" />

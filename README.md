# DazRenderQueue

A simple, lightweight batch rendering script for DAZ Studio that automatically renders multiple scenes in sequence. 

## How to install/remove the script:

Put the script in one of your content library folders. In Daz, go to the Content Library and find the script, then right-click it and select Create Custom Script. For Root, select scripts and then accept. Now, in the top toolbar under Scripts, you should see the Render Queue script, and from there you can open the UI.

If you want to remove it, go to Windows > Workspace > Customize. In the text filter, search for the script name once in Actions and once in Menus, and delete it from both.


### How to Use
Load the script into DAZ Studio, select your render output directory, and click **+ ADD SCENES** to queue your saved `.duf` files. Double-click a queue item to configure:

- **Output filename:** leave blank to use the scene filename. The selected extension is added automatically.
- **File type:** PNG, JPEG, TIFF, or BMP. JPEG does not preserve transparency.
- **Camera:** choose a camera read from the saved scene, **Saved active camera**, or **All cameras**. Reading the list does not load the scene into DAZ. Plain and gzip-compressed DUF files are supported.
- **Render Saved Animation Range:** keep the existing animation option.

Save camera changes in DAZ and reopen **Scene Options** to update the list. Only nodes identified as cameras in the saved file are resolved; the lookup skips figures, props and unknown external assets. An external camera needs camera metadata in the scene to appear, so save the complete scene in DAZ if needed. Unreadable camera metadata produces a warning. Cameras created dynamically by scripts are not listed. If a selected camera is missing or ambiguous when rendering starts, the queue stops so you can choose again or give cameras unique names.

Save the current scene before starting the queue. Click **START RENDER QUEUE** when ready. Render settings continue to come from each scene; queued output options do not rewrite scene files.

Animation and multi-camera batches add frame/camera suffixes. Existing nonempty output files are skipped for resume, so use a new filename or output folder for another version. Invalid Windows filenames and duplicate output names are rejected. JPEG quality and TIFF bit depth use DAZ's image-writer defaults.

Older queue records still default to PNG and the scene filename. Camera selections and output options are saved with the queue, including Unicode text.

<img width="740" height="676" alt="Image" src="https://github.com/user-attachments/assets/d723a8c2-7451-4933-9efc-c3df83002cb2" />
<br><br>
<img width="592" height="422" alt="Image" src="https://github.com/user-attachments/assets/cadededb-7073-4281-b8b4-55a477c0d8c8" />
<br><br>
<img width="578" height="274" alt="Image" src="https://github.com/user-attachments/assets/c5a723f3-3afa-42b0-b5dc-d63c7eb45714" />

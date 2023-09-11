import yazl from 'yazl'
import fs from 'fs/promises';
import path from 'path';

export const zipDir = async (zip: yazl.ZipFile, realPath: string, metadataPath: string | null) => {

  const stats = await fs.lstat(realPath);

  if (stats.isDirectory()) {
    const files = await fs.readdir(realPath);

    for (var i = 0; i < files.length; i++) {
      await zipDir(
        zip,
        path.join(realPath, files[i]),
        metadataPath ? metadataPath + "/" + files[i] : files[i]
      )
    }


  } else if (stats.isFile()) {
    if (metadataPath) {
      zip.addFile(realPath, metadataPath);
    }
  } else if (stats.isSymbolicLink()) {
    const target = await fs.readlink(realPath)

    await zipDir(
      zip,
      path.resolve(path.dirname(realPath), target),
      metadataPath
    );
  }
}



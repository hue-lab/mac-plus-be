import {Injectable} from '@nestjs/common';
import {StorageResponse} from "./dto/storage.response";
import {path} from 'app-root-path';
import {ensureDir, opendir, readdir, remove, stat, writeFile} from "fs-extra";
import {MFile} from "./helpers/mfile.class";
import * as sharp from "sharp";
import {DeleteDTO} from "./dto/delete.dto";
import {resolve, parse} from "path";

@Injectable()
export class StorageService {
  async saveFiles(files: MFile[]): Promise<StorageResponse[]>{
    const uploadFolder = `${path}/storage/images`
    await ensureDir(uploadFolder)
    const res: StorageResponse[] = []

    for(const file of files) {
      const fileName = file.originalname;
      await writeFile(`${uploadFolder}/${fileName}`, file.buffer)
      res.push({url: `storage/images/${fileName}`, name: fileName, shortName: parse(file.originalname).name})
    }
    return res
  }

  async convertToWebP(file: Buffer): Promise<Buffer>{
    return sharp(file)
      .webp()
      .toBuffer()
  }

  async convertAndSave(files: MFile[]) {
    const convertBucket: MFile[] = []
    for (const file of files) {
      const convert = {
        originalname: `${file.originalname.split('.')[0]}.webp`,
        buffer: await this.convertToWebP(file.buffer)
      }
      convertBucket.push(convert)
    }
    return this.saveFiles(convertBucket)
  }

  async getStorage() {
    const PATH = `${path}/storage/`
    return await this.getFiles(PATH)
  }

  async getFiles(dir) {
    const subFolders = await readdir(dir);
    const files = []
      await Promise.all(subFolders.map(async (subFolder) => {
      const res = resolve(dir, subFolder);
      files.push(res)
      return (await stat(res)).isDirectory() ? this.getFiles(res) : res;
    }));
    return files
  }

  async deleteFile(deleteDTO: DeleteDTO) {
    await remove(`${path}/storage/${deleteDTO.folder}/${deleteDTO.name}`)
    const isEmptyDir = await opendir(`${path}/storage/${deleteDTO.folder}/`)
  }
}

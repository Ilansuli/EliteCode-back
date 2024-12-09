import { getCollection } from "../../services/db.service";
import { loggerService } from "../../services/logger.service";
import { ObjectId } from "mongodb";
import { TCodeBlock } from "../../types/codeBlock";

export async function query() {
  try {
    const collection = await getCollection("codeBlock");
    var codeBlocks = await collection.find().toArray();
    return codeBlocks;
  } catch (err) {
    loggerService.error("cannot find codeBlocks", err);
    throw err;
  }
}

export async function getById(codeBlockId: string) {
  try {
    const collection = await getCollection("codeBlock");
    const codeBlock = collection.findOne({ _id: ObjectId(codeBlockId) });
    return codeBlock;
  } catch (err) {
    loggerService.error(`while finding codeBlock ${codeBlockId}`, err);
    throw err;
  }
}

export async function remove(codeBlockId: string) {
  try {
    const collection = await getCollection("codeBlock");
    await collection.deleteOne({ _id: ObjectId(codeBlockId) });
    return codeBlockId;
  } catch (err) {
    loggerService.error(`cannot remove codeBlock ${codeBlockId}`, err);
    throw err;
  }
}

export async function update(codeBlock: TCodeBlock) {
  try {
    const collection = await getCollection("codeBlock");
    const { _id } = codeBlock;
    delete codeBlock._id;
    await collection.updateOne({ _id: ObjectId(_id) }, { $set: codeBlock });
    return codeBlock;
  } catch (err) {
    loggerService.error(`cannot update codeBlock ${codeBlock._id}`, err);
    throw err;
  }
}

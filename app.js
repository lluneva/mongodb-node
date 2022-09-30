require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;

const assert = require("assert");

const circulationRepo = require("./repos/circulationRepo");
const data = require("./circulation.json");

const newItem = {
  Newspaper: "Lidija",
  "Daily Circulation, 2004": 1,
  "Daily Circulation, 2013": 2,
  "Change in Daily Circulation, 2004-2013": 1,
  "Pulitzer Prize Winners and Finalists, 1990-2003": 3,
  "Pulitzer Prize Winners and Finalists, 2004-2014": 2,
  "Pulitzer Prize Winners and Finalists, 1990-2014": 5,
};

const updatedItem = {
  Newspaper: "Alma",
  "Daily Circulation, 2004": 1,
  "Daily Circulation, 2013": 2,
  "Change in Daily Circulation, 2004-2013": 1,
  "Pulitzer Prize Winners and Finalists, 1990-2003": 3,
  "Pulitzer Prize Winners and Finalists, 2004-2014": 2,
  "Pulitzer Prize Winners and Finalists, 1990-2014": 5,
};

const main = async () => {
  const client = new MongoClient(process.env.URL);
  await client.connect();

  try {
    const results = await circulationRepo.loadData(data);
    assert.equal(data.length, results.insertedCount);

    const getData = await circulationRepo.get(); // should equal with initial data

    const filteredData = await circulationRepo.get({
      Newspaper: getData[4].Newspaper,
    });
    assert.deepEqual(getData[4], filteredData[0]);
    assert.equal(data.length, getData.length);

    const limitData = await circulationRepo.get({}, 3);
    assert.equal(limitData.length, 3);

    const id = getData[4]._id.toString();
    const byId = await circulationRepo.getById(id);
    assert.deepEqual(byId, getData[4]);

    // adding new item
    const addedItem = await circulationRepo.addItem(newItem);
    const addedItemQuery = await circulationRepo.getById(addedItem._id);
    assert.deepEqual(addedItemQuery, addedItem);
    assert(addedItem._id);

    // updating item
    const updatedAddedItem = await circulationRepo.updateItem(
      addedItem._id,
      updatedItem
    );
    const updatedItemQuery = await circulationRepo.getById(
      updatedAddedItem._id
    );
    assert.equal(updatedItemQuery.Newspaper, "Alma");

    // remove
    const removed = await circulationRepo.removeItem(addedItem._id);
    assert(removed);
    const getRemoved = await circulationRepo.getById(addedItem._id);
    console.log({ getRemoved });
    assert.equal(getRemoved, null);

    // aggregation
    const avgFinalists = await circulationRepo.averageFinalists();
    console.log({ avgFinalists });

    const avgFinalistsByChange =
      await circulationRepo.averageFinalistsByChange();

    console.log({ avgFinalistsByChange });
  } catch (error) {
    console.error(error);
  } finally {
    const admin = client.db(process.env.DB_NAME).admin();
    // console.log(await admin.serverStatus());
    await client.db(process.env.DB_NAME).dropDatabase();
    console.log(await admin.listDatabases());
    client.close();
  }
};

main();

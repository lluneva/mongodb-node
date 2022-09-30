const { MongoClient, ObjectID } = require("mongodb");

const circulationRepo = () => {
  const get = (query, limit) => {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(process.env.URL);

      try {
        // opens up db
        await client.connect();
        const db = client.db(process.env.DB_NAME);
        let items = db.collection("newspapers").find(query);

        if (limit > 0) {
          items = items.limit(limit);
        }

        resolve(await items.toArray());
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  };

  const getById = (id) => {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(process.env.URL);

      try {
        await client.connect();
        const db = client.db(process.env.DB_NAME);
        const item = await db
          .collection("newspapers")
          .findOne({ _id: ObjectID(id) });
        resolve(item);
        client.close();
      } catch (error) {
        console.error(`There was error while gettingById: ${error}`);
        reject(error);
      }
    });
  };

  const loadData = (data) => {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(process.env.URL);

      try {
        // opens up db
        await client.connect();
        const db = client.db(process.env.DB_NAME);

        // inserting data in circulationRepo
        results = await db.collection("newspapers").insertMany(data);

        resolve(results);
        client.close();
      } catch (error) {
        reject(error);
      }
    });
  };

  const addItem = (item) => {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(process.env.URL);

      try {
        await client.connect();
        const db = client.db(process.env.DB_NAME);
        const addedItem = await db.collection("newspapers").insertOne(item);
        resolve(addedItem.ops[0]);
        client.close();
      } catch (error) {
        console.error(`There was error while addedItem: ${error}`);
        reject(error);
      }
    });
  };

  const updateItem = (id, newItem) => {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(process.env.URL);

      try {
        await client.connect();
        const db = client.db(process.env.DB_NAME);
        const updatedItem = await db
          .collection("newspapers")
          .findOneAndReplace({ _id: ObjectID(id) }, newItem, {
            returnOriginal: false,
          });
        resolve(updatedItem.value);
        client.close();
      } catch (error) {
        console.error(`There was error while updatedItem: ${error}`);
        reject(error);
      }
    });
  };

  const removeItem = (id) => {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(process.env.URL);

      try {
        await client.connect();
        const db = client.db(process.env.DB_NAME);
        const result = await db
          .collection("newspapers")
          .deleteOne({ _id: ObjectID(id) });
        resolve(result.deletedCount === 1);
        client.close();
      } catch (error) {
        console.error(`There was error while removeItem: ${error}`);
        reject(error);
      }
    });
  };

  const averageFinalists = () => {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(process.env.URL);

      try {
        await client.connect();
        const db = client.db(process.env.DB_NAME);
        const average = await db
          .collection("newspapers")
          .aggregate([
            {
              $group: {
                _id: null,
                avgFinalists: {
                  $avg: "$Pulitzer Prize Winners and Finalists, 1990-2014",
                },
              },
            },
          ])
          .toArray();
        resolve(average[0].avgFinalists);
        client.close();
      } catch (error) {
        console.error(`There was error while averageFinalists: ${error}`);
        reject(error);
      }
    });
  };

  const averageFinalistsByChange = () => {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(process.env.URL);

      try {
        await client.connect();
        const db = client.db(process.env.DB_NAME);
        const ave = await db
          .collection("newspapers")
          .aggregate([
            {
              $project: {
                Newspaper: 1,
                "Pulitzer Prize Winners and Finalists, 1990-2014": 1,
                "Change in Daily Circulation, 2004-2013": 1,
                overallChange: {
                  $cond: {
                    if: {
                      $gte: ["$Change in Daily Circulation, 2004-2013", 0],
                    },
                    then: "positive",
                    else: "negative",
                  },
                },
              },
            },
            {
              $group: {
                _id: "$overallChange",
                averagegFinalists: {
                  $avg: "$Pulitzer Prize Winners and Finalists, 1990-2014",
                },
              },
            },
          ])
          .toArray();
        resolve(ave);
        client.close();
      } catch (error) {
        console.error(`There was error while averageFinalists: ${error}`);
        reject(error);
      }
    });
  };

  return {
    loadData,
    get,
    getById,
    addItem,
    updateItem,
    removeItem,
    averageFinalists,
    averageFinalistsByChange,
  };
};

module.exports = circulationRepo();

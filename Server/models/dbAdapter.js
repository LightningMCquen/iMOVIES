const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, "0");
  const random = "xxxxxxxxxxxxxxxx".replace(/[x]/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  );
  return timestamp + random;
}

class EmbeddedCollection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name.toLowerCase()}.json`);
    this.data = this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        return JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
      }
    } catch (e) {
      console.warn(`Error reading ${this.filePath}:`, e.message);
    }
    return [];
  }

  _save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.warn(`Error saving ${this.filePath}:`, e.message);
    }
  }

  _matches(item, query) {
    if (!query || Object.keys(query).length === 0) return true;

    if (query.$or && Array.isArray(query.$or)) {
      const orMatched = query.$or.some((subQuery) => this._matches(item, subQuery));
      if (!orMatched) return false;
    }

    for (const key of Object.keys(query)) {
      if (key === "$or") continue;
      const val = query[key];
      const itemVal = item[key];

      if (val && typeof val === "object" && !(val instanceof RegExp)) {
        if (val.$regex) {
          const regex = new RegExp(val.$regex, val.$options || "");
          if (!regex.test(String(itemVal || ""))) return false;
        } else if (val.$ne !== undefined) {
          if (itemVal === val.$ne) return false;
        } else if (val.$lt !== undefined) {
          if (!(itemVal < val.$lt)) return false;
        } else if (val.$gt !== undefined) {
          if (!(itemVal > val.$gt)) return false;
        }
      } else if (val instanceof RegExp) {
        if (!val.test(String(itemVal || ""))) return false;
      } else {
        if (String(itemVal) !== String(val)) return false;
      }
    }
    return true;
  }

  _wrap(doc) {
    if (!doc) return null;
    const self = this;
    const wrapped = { ...doc };

    Object.defineProperty(wrapped, "save", {
      enumerable: false,
      value: async function () {
        this.updatedAt = new Date().toISOString();
        const index = self.data.findIndex((d) => String(d._id) === String(this._id));
        if (index >= 0) {
          self.data[index] = { ...this };
        } else {
          self.data.push({ ...this });
        }
        self._save();
        return self._wrap(this);
      },
    });

    return wrapped;
  }

  find(query = {}) {
    let sortObj = null;

    const execute = () => {
      let matched = this.data.filter((item) => this._matches(item, query));
      let results = matched.map((d) => this._wrap(d));

      if (sortObj) {
        const [field, direction] = Object.entries(sortObj)[0] || ["createdAt", -1];
        results.sort((a, b) => {
          if (direction === -1) return b[field] > a[field] ? 1 : -1;
          return a[field] > b[field] ? 1 : -1;
        });
      }

      return results;
    };

    const queryObj = {
      sort: function (s) {
        sortObj = s;
        return queryObj;
      },
      select: function () {
        return queryObj;
      },
      then: function (onFulfilled, onRejected) {
        try {
          const res = execute();
          return Promise.resolve(onFulfilled ? onFulfilled(res) : res);
        } catch (err) {
          return Promise.reject(onRejected ? onRejected(err) : err);
        }
      },
      catch: function (onRejected) {
        return queryObj.then(null, onRejected);
      },
    };

    return queryObj;
  }

  findOne(query = {}) {
    const execute = () => {
      const found = this.data.find((item) => this._matches(item, query));
      return this._wrap(found);
    };

    const queryObj = {
      select: function () {
        return queryObj;
      },
      then: function (onFulfilled, onRejected) {
        try {
          const res = execute();
          return Promise.resolve(onFulfilled ? onFulfilled(res) : res);
        } catch (err) {
          return Promise.reject(onRejected ? onRejected(err) : err);
        }
      },
      catch: function (onRejected) {
        return queryObj.then(null, onRejected);
      },
    };

    return queryObj;
  }

  findById(id) {
    const execute = () => {
      const found = this.data.find((item) => String(item._id) === String(id));
      return this._wrap(found);
    };

    const queryObj = {
      select: function () {
        return queryObj;
      },
      then: function (onFulfilled, onRejected) {
        try {
          const res = execute();
          return Promise.resolve(onFulfilled ? onFulfilled(res) : res);
        } catch (err) {
          return Promise.reject(onRejected ? onRejected(err) : err);
        }
      },
      catch: function (onRejected) {
        return queryObj.then(null, onRejected);
      },
    };

    return queryObj;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const index = this.data.findIndex((item) => String(item._id) === String(id));
    if (index === -1) return null;
    const updated = {
      ...this.data[index],
      ...update,
      updatedAt: new Date().toISOString(),
    };
    this.data[index] = updated;
    this._save();
    return this._wrap(updated);
  }

  async findByIdAndDelete(id) {
    const index = this.data.findIndex((item) => String(item._id) === String(id));
    if (index === -1) return null;
    const deleted = this.data.splice(index, 1)[0];
    this._save();
    return this._wrap(deleted);
  }

  async findOneAndDelete(query) {
    const index = this.data.findIndex((item) => this._matches(item, query));
    if (index === -1) return null;
    const deleted = this.data.splice(index, 1)[0];
    this._save();
    return this._wrap(deleted);
  }

  async deleteMany(query) {
    const initialLen = this.data.length;
    this.data = this.data.filter((item) => !this._matches(item, query));
    this._save();
    return { deletedCount: initialLen - this.data.length };
  }

  async countDocuments(query = {}) {
    return this.data.filter((item) => this._matches(item, query)).length;
  }

  async insertMany(docs) {
    const inserted = docs.map((d) => {
      const doc = {
        _id: d._id || generateObjectId(),
        ...d,
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.push(doc);
      return this._wrap(doc);
    });
    this._save();
    return inserted;
  }

  async create(docData) {
    const doc = {
      _id: docData._id || generateObjectId(),
      ...docData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.push(doc);
    this._save();
    return this._wrap(doc);
  }

  async aggregate(pipeline = []) {
    let results = [...this.data];
    for (const stage of pipeline) {
      if (stage.$match) {
        results = results.filter((item) => this._matches(item, stage.$match));
      }
      if (stage.$group) {
        const sumField = stage.$group.total?.$sum?.replace("$", "");
        if (sumField) {
          const total = results.reduce((sum, item) => sum + (Number(item[sumField]) || 0), 0);
          return [{ _id: null, total }];
        }
      }
    }
    return results;
  }
}

function createModel(name, mongooseModel) {
  const embedded = new EmbeddedCollection(name);

  function ModelConstructor(docData) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      return new mongooseModel(docData);
    }

    const id = docData?._id || generateObjectId();
    const doc = {
      _id: id,
      ...docData,
      createdAt: docData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return embedded._wrap(doc);
  }

  const methods = [
    "find",
    "findOne",
    "findById",
    "findByIdAndUpdate",
    "findByIdAndDelete",
    "findOneAndDelete",
    "deleteMany",
    "countDocuments",
    "insertMany",
    "create",
    "aggregate",
  ];

  for (const m of methods) {
    ModelConstructor[m] = function (...args) {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        return mongooseModel[m](...args);
      }
      return embedded[m](...args);
    };
  }

  return ModelConstructor;
}

module.exports = { createModel };

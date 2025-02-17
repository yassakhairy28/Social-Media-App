export const create = async ({ model, data }) => {
  const document = await model.create(data);
  return document;
};

export const find = async ({
  model,
  data = {},
  select = "",
  populate = "",
  skip = 0,
  limit = 1000,
}) => {
  const document = await model
    .find(data)
    .select(select)
    .populate(populate)
    .limit(limit)
    .skip(skip)
  return document;
};

export const findOne = async ({
  model,
  data = {},
  select = "",
  populate = "",
}) => {
  const document = await model.findOne(data).select(select).populate(populate);
  return document;
};

export const findById = async ({
  model,
  id = "",
  select = "",
  populate = "",
}) => {
  const document = await model.findById(id).select(select).populate(populate);
  return document;
};
export const findByIdAndUpdate = async ({
  model,
  filter = "",
  data = {},
  options = {},
  select = "",
  populate = "",
}) => {
  const document = await model
    .findByIdAndUpdate(filter, data, options)
    .select(select)
    .populate(populate);
  return document;
};
export const findOneAndUpdate = async ({
  model,
  filter = "",
  data = {},
  options = {},
  select = "",
  populate = "",
}) => {
  const document = await model
    .findOneAndUpdate(filter, data, options)
    .select(select)
    .populate(populate);
  return document;
};

export const updateOne = async ({
  model,
  filter = "",
  data = {},
  options = {},
}) => {
  const document = await model.updateOne(filter, data, options);
  return document;
};

export const updateMany = async ({
  model,
  filter = "",
  data = {},
  options = {},
}) => {
  const document = await model.updateMany(filter, data, options);
  return document;
};

export const findByIdAndDelete = async ({
  model,
  filter = "",
  select = "",
  populate = "",
}) => {
  const document = await model
    .findByIdAndDelete(filter)
    .select(select)
    .populate(populate);
  return document;
};

export const deleteOne = async ({ model, filter = "" }) => {
  const document = await model.deleteOne(filter);
  return document;
};

export const deleteMany = async ({ model, filter = "" }) => {
  const document = await model.deleteMany(filter);
  return document;
};

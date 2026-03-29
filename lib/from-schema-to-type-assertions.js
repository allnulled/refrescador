module.exports = function(data, schema) {
  if(typeof data !== "object") {
    throw new Error("Parameter «data» must be object on «from-schema-to-type-assertion»");
  }
  if(typeof schema !== "object") {
    throw new Error("Parameter «schema» must be object on «from-schema-to-type-assertion»");
  }
  const dataKeys = Object.keys(data);
  const schemaKeys = Object.keys(schema);
  // Iteramos las propiedades iniciales para saber si sobra alguna
  for(let index=0; index<dataKeys.length; index++) {
    const dataKey = dataKeys[index];
    if(schemaKeys.indexOf(dataKey) === -1) {
      throw new Error(`Property «${dataKey}» is not accepted and it can only be one out of «${schemaKeys.join("|")}» on «from-schema-to-type-assertions»`);
    }
  }
  // Iteramos las propiedades del esquema para saber si falta alguna
  for(let index=0; index<schemaKeys.length; index++) {
    const schemaKey = schemaKeys[index];
    const schemaValue = schema[schemaKey];
    const schemaType = schemaValue.type;
    const hasDefault = "default" in schemaValue;
    const hasKey = schemaKey in data;
    if((!hasDefault) && (!hasKey)) {
      throw new Error(`Property «${schemaKey}» must be explicitly set or provided with «default» on «from-schema-to-type-assertions»`);
    }
    const dataValue = hasKey ? data[schemaKey] : (typeof schemaValue.default === "function" && schemaType !== Function) ? schemaValue.default(data) : schemaValue.default;
    if(schemaType === Array) {
      if(!Array.isArray(dataValue)) {
        throw new Error(`Property «${schemaKey}» must be array but «${typeof dataValue}» was found instead on «from-schema-to-type-assertions»`);
      }
    } else if(schemaType === String) {
      if(typeof dataValue !== "string") {
        throw new Error(`Property «${schemaKey}» must be string but «${typeof dataValue}» was found instead on «from-schema-to-type-assertions»`);
      }
    } else if(schemaType === Boolean) {
      if(typeof dataValue !== "boolean") {
        throw new Error(`Property «${schemaKey}» must be boolean but «${typeof dataValue}» was found instead on «from-schema-to-type-assertions»`);
      }
    } else if(schemaType === Object) {
      if(typeof dataValue !== "object") {
        throw new Error(`Property «${schemaKey}» must be object but «${typeof dataValue}» was found instead on «from-schema-to-type-assertions»`);
      }
    } else if(schemaType === Number) {
      if(typeof dataValue !== "number") {
        throw new Error(`Property «${schemaKey}» must be number but «${typeof dataValue}» was found instead on «from-schema-to-type-assertions»`);
      }
    } else if(typeof schemaType === "function") {
      if(dataValue instanceof schemaType) {
        throw new Error(`Property «${schemaKey}» must be instance of «${schemaType.name}» but «${typeof dataValue}» was found instead on «from-schema-to-type-assertions»`);
      }
    } else if(schemaType === Function) {
      if(typeof dataValue !== "function") {
        throw new Error(`Property «${schemaKey}» must be function but «${typeof dataValue}» was found instead on «from-schema-to-type-assertions»`);
      }
    }
  }
}
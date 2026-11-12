function rejectUse() {
  const error = new Error('The form-data dependency stub was accessed');
  error.code = 'AXIOS_DIAGNOSTIC_STUB_USED';
  throw error;
}

// Allow import of the default binding, but fail if the binding is used.
export default new Proxy(function blockedFormData() {}, {
  apply: rejectUse,
  construct: rejectUse,
  defineProperty: rejectUse,
  deleteProperty: rejectUse,
  get: rejectUse,
  getOwnPropertyDescriptor: rejectUse,
  getPrototypeOf: rejectUse,
  has: rejectUse,
  isExtensible: rejectUse,
  ownKeys: rejectUse,
  preventExtensions: rejectUse,
  set: rejectUse,
  setPrototypeOf: rejectUse,
});

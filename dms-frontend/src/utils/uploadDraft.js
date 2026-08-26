/* AEGIS Console: selected files remain in browser memory through a re-authentication handoff when technically safe. */
let draft = { file: null, name: "", permissions: { roles: [], users: [] } };
export const getUploadDraft = () => draft;
export const saveUploadDraft = (next) => { draft = { ...draft, ...next }; };
export const clearUploadDraft = () => { draft = { file: null, name: "", permissions: { roles: [], users: [] } }; };

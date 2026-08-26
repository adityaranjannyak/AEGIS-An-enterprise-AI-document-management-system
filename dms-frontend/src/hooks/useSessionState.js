/* AEGIS Console: page-level filters and draft conversations remain available through a re-authentication flow. */
import { useEffect, useState } from "react";
import { getSessionValue, persistSessionValue } from "../utils/sessionState.js";

export function useSessionState(key, initialValue) {
  const [value, setValue] = useState(() => getSessionValue(key, initialValue));
  useEffect(() => persistSessionValue(key, value), [key, value]);
  return [value, setValue];
}

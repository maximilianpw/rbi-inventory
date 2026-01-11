// React 19 has useSyncExternalStore built-in, so we re-export from React
// This shim handles packages that still import from use-sync-external-store/shim
/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/prefer-nullish-coalescing, max-params */
import { useSyncExternalStore, useRef, useCallback, useEffect } from 'react'

export { useSyncExternalStore }

// For with-selector, we provide an implementation using the built-in hook
export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot: undefined | null | (() => Snapshot),
  selector: (snapshot: Snapshot) => Selection,
  isEqual?: (a: Selection, b: Selection) => boolean,
): Selection {
  const instRef = useRef<{
    hasValue: boolean
    value: Selection
    getSnapshot: () => Snapshot
    selector: (snapshot: Snapshot) => Selection
    isEqual: (a: Selection, b: Selection) => boolean
  } | null>(null)

  const equalityFn = isEqual || Object.is
  const serverSnapshotRef = useRef<Snapshot | null>(null)
  const serverSnapshotGetterRef = useRef<typeof getServerSnapshot>(getServerSnapshot)

  // Initialize the ref on first render
  if (instRef.current === null) {
    instRef.current = {
      hasValue: false,
      value: undefined as Selection,
      getSnapshot,
      selector,
      isEqual: equalityFn,
    }
  }

  // Update the ref values in an effect to avoid lint warnings about refs during render
  useEffect(() => {
    if (instRef.current) {
      instRef.current.getSnapshot = getSnapshot
      instRef.current.selector = selector
      instRef.current.isEqual = equalityFn
    }
    if (serverSnapshotGetterRef.current !== getServerSnapshot) {
      serverSnapshotGetterRef.current = getServerSnapshot
      serverSnapshotRef.current = null
    }
  }, [getSnapshot, selector, equalityFn, getServerSnapshot])

  const getSelection = useCallback(() => {
    const inst = instRef.current!
    const nextSnapshot = inst.getSnapshot()
    const nextSelection = inst.selector(nextSnapshot)

    if (inst.hasValue && inst.isEqual(inst.value, nextSelection)) {
      return inst.value
    }

    inst.hasValue = true
    inst.value = nextSelection
    return nextSelection
  }, [])

  const getServerSelection = useCallback(() => {
    if (getServerSnapshot === null || getServerSnapshot === undefined) {
      throw new Error('Missing getServerSnapshot')
    }
    if (serverSnapshotRef.current === null) {
      serverSnapshotRef.current = getServerSnapshot()
    }
    const inst = instRef.current!
    return inst.selector(serverSnapshotRef.current)
  }, [getServerSnapshot])

  const maybeGetServerSelection =
    getServerSnapshot === null || getServerSnapshot === undefined
      ? undefined
      : getServerSelection

  return useSyncExternalStore(subscribe, getSelection, maybeGetServerSelection)
}

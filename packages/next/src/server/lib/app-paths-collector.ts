type AppPaths = {
  page: string
  pathname: string
  appPaths: ReadonlyArray<string>
}

export class AppPathsCollector {
  private readonly appPaths = new Map<string, string[]>()

  /**
   * Add the given page to the app paths for the given pathname.
   *
   * @param pathname the pathname to add the page to
   * @param page the page to add to the pathname
   * @returns the number of app paths for the given pathname
   */
  public push(pathname: string, page: string): number {
    let appPaths = this.appPaths.get(pathname) ?? []
    if (appPaths.length === 0) {
      this.appPaths.set(pathname, appPaths)
    }

    return appPaths.push(page)
  }

  public clear(): void {
    this.appPaths.clear()
  }

  /**
   * Get the pathnames that have app paths, sorted.
   *
   * @returns the pathnames that have app paths
   */
  public pathnames(): ReadonlyArray<string> {
    return Array.from(this.appPaths.keys()).sort()
  }

  public get(pathname: string): AppPaths | null {
    let appPaths = this.appPaths.get(pathname)
    if (!Array.isArray(appPaths)) return null

    // Sort the app paths so that we can compare them with other app paths,
    // the order must be deterministic.
    appPaths = appPaths.concat().sort()

    return {
      page: appPaths[appPaths.length - 1],
      pathname,
      appPaths,
    }
  }

  /**
   * Get the entries of the app paths.
   *
   * @returns the entries of the app paths
   */
  public toSortedArray(): ReadonlyArray<AppPaths> {
    const arr: Array<AppPaths> = []
    for (const pathname of this.pathnames()) {
      const appPaths = this.get(pathname)
      if (!appPaths) continue

      arr.push(appPaths)
    }

    return arr
  }

  /**
   * Get the object representation of the app paths.
   *
   * @returns the object representation of the app paths
   */
  public toObject(): Record<string, ReadonlyArray<string>> {
    const obj: Record<string, ReadonlyArray<string>> = {}
    for (const pathname of this.pathnames()) {
      let appPaths = this.appPaths.get(pathname)
      if (!Array.isArray(appPaths)) continue

      appPaths = appPaths.concat().sort()

      obj[pathname] = appPaths
    }

    return obj
  }
}

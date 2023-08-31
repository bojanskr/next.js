import { FileReader } from './helpers/file-reader/file-reader'
import { AppPageRouteMatcher } from '../../route-matchers/app-page-route-matcher'
import { RouteKind } from '../../route-kind'
import { FileCacheRouteMatcherProvider } from './file-cache-route-matcher-provider'
import { DevAppNormalizers } from '../../normalizers/built/app'
import { AppPageRouteDefinition } from '../../route-definitions/app-page-route-definition'
import { AppPathsCollector } from '../../../lib/app-paths-collector'

export class DevAppPageRouteMatcherProvider extends FileCacheRouteMatcherProvider<AppPageRouteMatcher> {
  private readonly expression: RegExp
  private readonly normalizers: DevAppNormalizers

  constructor(
    appDir: string,
    extensions: ReadonlyArray<string>,
    reader: FileReader
  ) {
    super(appDir, reader)

    this.normalizers = new DevAppNormalizers(appDir, extensions)

    // Match any page file that ends with `/page.${extension}` under the app
    // directory.
    this.expression = new RegExp(`[/\\\\]page\\.(?:${extensions.join('|')})$`)
  }

  private prepare(files: ReadonlyArray<string>) {
    const routePages: Record<string, string> = {}
    const routePathnames: Array<string> = []
    const routeAppPaths = new AppPathsCollector()
    for (const filename of files) {
      // If the file isn't a match for this matcher, then skip it.
      if (!this.expression.test(filename)) continue

      const page = this.normalizers.page.normalize(filename)

      // Validate that this is not an ignored page, and skip it if it is.
      if (page.includes('/_')) continue

      // Map the page to the filename.
      routePages[page] = filename

      const pathname = this.normalizers.pathname.normalize(filename)

      // Collect all the app paths for this page.
      const collected = routeAppPaths.push(pathname, page)
      if (collected === 1) {
        routePathnames.push(pathname)
      }
    }

    const definitions: Array<AppPageRouteDefinition> = []
    for (const { pathname, page, appPaths } of routeAppPaths.toSortedArray()) {
      const filename = routePages[page]
      const bundlePath = this.normalizers.bundlePath.normalize(filename)

      definitions.push({
        kind: RouteKind.APP_PAGE,
        pathname,
        page,
        bundlePath,
        filename,
        appPaths,
      })
    }

    return definitions
  }

  protected async transform(
    files: ReadonlyArray<string>
  ): Promise<ReadonlyArray<AppPageRouteMatcher>> {
    const matchers: Array<AppPageRouteMatcher> = []
    for (const definition of this.prepare(files)) {
      matchers.push(new AppPageRouteMatcher(definition))
    }

    return matchers
  }
}

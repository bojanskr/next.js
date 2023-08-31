import { isAppPageRoute } from '../../../lib/is-app-page-route'

import { APP_PATHS_MANIFEST } from '../../../shared/lib/constants'
import { AppPathsCollector } from '../../lib/app-paths-collector'
import { AppNormalizers } from '../normalizers/built/app'
import { AppPageRouteDefinition } from '../route-definitions/app-page-route-definition'
import { RouteKind } from '../route-kind'
import { AppPageRouteMatcher } from '../route-matchers/app-page-route-matcher'
import {
  Manifest,
  ManifestLoader,
} from './helpers/manifest-loaders/manifest-loader'
import { ManifestRouteMatcherProvider } from './manifest-route-matcher-provider'

export class AppPageRouteMatcherProvider extends ManifestRouteMatcherProvider<AppPageRouteMatcher> {
  private readonly normalizers: AppNormalizers

  constructor(distDir: string, manifestLoader: ManifestLoader) {
    super(APP_PATHS_MANIFEST, manifestLoader)

    this.normalizers = new AppNormalizers(distDir)
  }

  private prepare(manifest: Manifest) {
    // This matcher only matches app pages.
    const pages = Object.keys(manifest).filter((page) => isAppPageRoute(page))

    // Collect all the app paths for each page. This could include any parallel
    // routes.
    const routeAppPaths = new AppPathsCollector()
    for (const page of pages) {
      const pathname = this.normalizers.pathname.normalize(page)

      // Collect all the app paths for this page. If this is the first time
      // we've seen this page, then add it to the list of route pathnames.
      routeAppPaths.push(pathname, page)
    }

    const definitions: Array<AppPageRouteDefinition> = []
    for (const { pathname, page, appPaths } of routeAppPaths.toSortedArray()) {
      const filename = this.normalizers.filename.normalize(manifest[page])
      const bundlePath = this.normalizers.bundlePath.normalize(page)

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
    manifest: Manifest
  ): Promise<ReadonlyArray<AppPageRouteMatcher>> {
    const matchers: Array<AppPageRouteMatcher> = []
    for (const definition of this.prepare(manifest)) {
      matchers.push(new AppPageRouteMatcher(definition))
    }

    return matchers
  }
}

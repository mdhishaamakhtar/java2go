import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'dependency-management',
  label: 'Dependency Management',
  summary:
    'Modules, go.mod and go.sum in place of Maven or Gradle: adding dependencies, major versions, local development and private repositories.',
  blocks: [
    {
      type: 'prose',
      text: 'Every Java project starts with a `pom.xml` or `build.gradle` and a build tool to interpret it. Go has one built-in module system driven by the `go` command itself: no plugins, no wrapper scripts, no build language.',
    },
    { type: 'heading', text: 'Initialising a module' },
    {
      type: 'compare',
      javaLabel: 'Java — Maven or Gradle scaffolding',
      goLabel: 'Go — go mod init',
      javaLang: 'bash',
      goLang: 'bash',
      java: `# Maven archetype
mvn archetype:generate \\
  -DgroupId=com.mycompany \\
  -DartifactId=my-app \\
  -DarchetypeArtifactId=maven-archetype-quickstart

# Gradle
gradle init --type java-application`,
      go: `# One command, one file
go mod init github.com/mycompany/my-app

# go.mod now contains:
#   module github.com/mycompany/my-app
#
#   go 1.27.1`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: 'The module path is the import prefix for every package in the module. It does not have to resolve to a real repository for a private service, but using a domain or repository you control avoids collisions. The `go` line is the **minimum** Go version the module requires; `go mod init` writes the version of the toolchain you ran it with. Lower it deliberately (for example to `go 1.26.0`) if the code must still build with older releases, which matters most for libraries.',
    },
    { type: 'heading', text: 'go.mod and go.sum' },
    {
      type: 'compare',
      javaLabel: 'Java — pom.xml',
      goLabel: 'Go — go.mod',
      javaLang: 'xml',
      java: `<project>
  <groupId>com.mycompany</groupId>
  <artifactId>my-app</artifactId>
  <version>1.0.0</version>

  <dependencies>
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>2.19.0</version>
    </dependency>
  </dependencies>
</project>`,
      go: `module github.com/mycompany/my-app

go 1.26.0

require (
    github.com/jackc/pgx/v5 v5.7.5
    golang.org/x/sync v0.16.0
)

require (
    // Pulled in by the modules above
    github.com/jackc/puddle/v2 v2.2.2 // indirect
)`,
    },
    {
      type: 'table',
      rows: [
        ['`pom.xml` / `build.gradle`', '`go.mod`'],
        ['`gradle.lockfile` (opt-in)', '`go.sum`: always present, commit it'],
        ['`~/.m2/repository`', 'The module cache: `go env GOMODCACHE`'],
        ['`mvnw` / `gradlew`', 'The `go` command; a `toolchain` line can pin the exact Go version'],
        ['`mvn package` / `gradle build`', '`go build ./...`'],
        ['`mvn dependency:resolve`', '`go mod download`'],
        ['`mvn dependency:tree`', '`go mod graph` or `go list -m all`'],
        ['`mvn dependency:analyze`', '`go mod tidy`: adds missing and removes unused requirements'],
      ],
    },
    {
      type: 'why',
      text: '`go.sum` records a cryptographic hash of every module version the build depends on. The first time a version is downloaded, the `go` command also checks it against the public checksum database at `sum.golang.org`, so a tampered or re-tagged release fails the build instead of being silently used. Maven Central offers signatures, but verifying them is opt-in; in Go it is the default.',
    },
    {
      type: 'callout',
      title: 'Minimal version selection',
      tone: 'go',
      text: 'Maven resolves conflicts with "nearest definition wins", which can silently pick an older version than a library asked for. Go uses **minimal version selection**: for each module, the build uses the highest version that any `require` line in the graph asks for, and never anything newer. The result is deterministic, needs no lock-file solver, and changes only when a `go.mod` file changes.',
    },
    { type: 'heading', text: 'Adding and removing dependencies' },
    {
      type: 'codeblock',
      lang: 'bash',
      label: 'day-to-day dependency commands',
      code: `# Add or upgrade a dependency (updates go.mod and go.sum)
go get github.com/jackc/pgx/v5@v5.7.5
go get github.com/jackc/pgx/v5@latest

# Upgrade all direct and indirect dependencies (minor/patch)
go get -u ./...

# Add missing requirements, drop unused ones
go mod tidy

# Pre-fetch everything into the module cache (useful in CI images)
go mod download

# Why is this module in my build?
go mod why -m github.com/jackc/puddle/v2

# Which dependencies have newer versions?
go list -m -u all`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'Run `go mod tidy` before committing, and run `go mod tidy -diff` in CI to fail the build when `go.mod` or `go.sum` is out of date.',
    },
    { type: 'heading', text: 'Semantic import versioning' },
    {
      type: 'prose',
      text: 'Go has a rule with no Maven or Gradle equivalent: a module that releases a breaking v2 or later changes its module path to end in `/v2`. The major version is part of the import path, so two major versions are simply two different packages.',
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'v1 and v2 of the same library in one build',
      code: `// go.mod
require (
    github.com/some/lib v1.5.0    // v0/v1: no suffix
    github.com/some/lib/v2 v2.1.0 // v2+: suffix in the path
)

// Each major version is a separate import path
import (
    libv1 "github.com/some/lib"
    libv2 "github.com/some/lib/v2"
)

// Both compile into the same binary without clashing.
// In Java, two versions of one artifact on the classpath
// means shading or a runtime NoSuchMethodError.`,
    },
    { type: 'heading', text: 'Working on several modules at once' },
    {
      type: 'compare',
      javaLabel: 'Java — mvn install a SNAPSHOT',
      goLabel: 'Go — a go.work workspace',
      javaLang: 'bash',
      goLang: 'bash',
      java: `# Build and install the library locally
cd ../shared-lib
mvn install   # publishes 1.0-SNAPSHOT to ~/.m2

# Then depend on the SNAPSHOT version
# from the application's pom.xml`,
      go: `# From a parent directory holding both repos
go work init ./my-app ./shared-lib

# go.work now says: build my-app against the
# local shared-lib checkout, not the published one.
# Keep go.work out of version control.

cd my-app && go build ./...`,
    },
    {
      type: 'prose',
      text: 'The older alternative is a `replace` directive in `go.mod`, for example `replace github.com/mycompany/shared-lib => ../shared-lib`. It works, but it is easy to commit by accident. `go.work` (Go 1.18+) is the better tool for local multi-module development because it lives outside any module.',
    },
    {
      type: 'note',
      noteType: 'warn',
      text: '`replace` directives only apply to the main module being built. A `replace` inside a library you publish is ignored by everyone who depends on it, so it cannot be used to patch your consumers’ builds, and a relative-path `replace` will break your own CI if the path does not exist there.',
    },
    { type: 'heading', text: 'Pinning tools with the tool directive (Go 1.24+)' },
    {
      type: 'prose',
      text: 'Code generators and linters need pinned versions just like libraries. Before Go 1.24 the idiom was a `tools.go` file with a `//go:build tools` constraint and blank imports. Go 1.24 added a `tool` directive to `go.mod`.',
    },
    {
      type: 'compare',
      javaLabel: 'Java — pinned build plugin',
      goLabel: 'Go 1.24+ — tool directive',
      javaLang: 'xml',
      java: `<build>
  <plugins>
    <plugin>
      <groupId>org.openapitools</groupId>
      <artifactId>openapi-generator-maven-plugin</artifactId>
      <version>7.14.0</version>
    </plugin>
  </plugins>
</build>`,
      go: `// Add a tool: records it in go.mod and go.sum
//   go get -tool github.com/sqlc-dev/sqlc/cmd/sqlc@latest

// go.mod then contains
tool github.com/sqlc-dev/sqlc/cmd/sqlc

// plus a matching require line. Run it with
//   go tool sqlc generate
// Everyone on the team gets the same version.`,
    },
    { type: 'heading', text: 'Private modules' },
    {
      type: 'codeblock',
      lang: 'bash',
      label: 'GOPRIVATE for company repositories',
      code: `# Modules matching GOPRIVATE bypass the public proxy
# (proxy.golang.org) and the public checksum database.
go env -w GOPRIVATE='github.com/mycompany/*'

# GOPRIVATE is the default for both GONOPROXY and GONOSUMDB;
# set those separately only if you run a private proxy.

# Authentication is plain git. For example, force SSH:
git config --global url."git@github.com:".insteadOf "https://github.com/"`,
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'The equivalent of a corporate Nexus or Artifactory is a Go module proxy set with `GOPROXY` (for example Athens, or Artifactory’s Go support). Many teams need nothing more than `GOPRIVATE` plus git credentials, because Go downloads source straight from version control.',
    },
  ],
};

export default section;

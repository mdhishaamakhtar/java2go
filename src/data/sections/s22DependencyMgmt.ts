import type { Section } from '@/types/section';

const section: Section = {
  id: 'dependency-management',
  title: '02',
  label: 'Dependency Management',
  blocks: [
    {
      type: 'prose',
      text: 'Every Java project starts with a `pom.xml` or `build.gradle`. Go has a single, built-in module system: `go mod`. No plugins, no wrapper scripts — just the `go` tool.',
    },
    { type: 'heading', text: 'Initialising a module' },
    {
      type: 'compare',
      javaLabel: 'Java — Maven / Gradle',
      goLabel: 'Go — go mod init',
      java: `# Maven archetype
mvn archetype:generate \\
  -DgroupId=com.mycompany \\
  -DartifactId=my-app \\
  -DarchetypeArtifactId=maven-archetype-quickstart

# Gradle init
gradle init --type java-application`,
      go: `# One command, one file created
go mod init github.com/mycompany/my-app

# Creates go.mod:
# module github.com/mycompany/my-app
# go 1.24`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: 'The module path (`github.com/mycompany/my-app`) is the canonical import path used by other modules to import your code. It does not have to be a real URL for private projects, but using a domain you own avoids future collisions.',
    },
    { type: 'heading', text: 'go.mod and go.sum' },
    {
      type: 'compare',
      javaLabel: 'Java — pom.xml',
      goLabel: 'Go — go.mod',
      java: `<!-- pom.xml -->
<project>
  <groupId>com.mycompany</groupId>
  <artifactId>my-app</artifactId>
  <version>1.0.0</version>

  <dependencies>
    <dependency>
      <groupId>com.github.gin-gonic</groupId>
      <artifactId>gin</artifactId>
      <version>1.9.1</version>
    </dependency>
  </dependencies>
</project>`,
      go: `module github.com/mycompany/my-app

go 1.24

require (
    github.com/gin-gonic/gin v1.9.1
)`,
    },
    {
      type: 'table',
      rows: [
        ['pom.xml / build.gradle', 'go.mod'],
        ['~/.m2/repository (local cache)', '$(go env GOPATH)/pkg/mod'],
        ['maven-wrapper / gradlew', 'go binary (ships with Go install)'],
        ['mvn install / gradle build', 'go build ./...'],
        ['mvn dependency:resolve', 'go mod tidy'],
        ['lockfile (Gradle: .lockfile)', 'go.sum (cryptographic checksums)'],
      ],
    },
    {
      type: 'why',
      text: '`go.sum` stores a cryptographic hash for every dependency version downloaded — both the module zip and its go.mod. If a dependency is tampered with on the proxy, the checksum mismatch fails the build. It is stricter than Maven\'s approach, and should be committed to source control.',
    },
    { type: 'heading', text: 'Adding and removing dependencies' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'day-to-day dependency commands',
      code: `# Add a dependency (downloads, updates go.mod + go.sum)
go get github.com/gin-gonic/gin@v1.9.1

# Add latest version
go get github.com/gin-gonic/gin@latest

# Remove unused dependencies + add missing ones
go mod tidy

# Download all dependencies to local cache (useful in CI)
go mod download

# View dependency graph
go mod graph

# Explain why a dependency is present
go mod why github.com/some/package`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'Run `go mod tidy` before committing. It removes unused entries from go.mod/go.sum and ensures every import in your code has a matching require directive. The equivalent of cleaning up unused Maven dependencies, automatically.',
    },
    { type: 'heading', text: 'Semantic import versioning' },
    {
      type: 'prose',
      text: 'Go enforces a convention that has no Maven/Gradle equivalent: when a module releases a v2 or higher breaking change, the module path itself changes to include `/v2`. This means old and new major versions can coexist in the same binary.',
    },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'v1 and v2 of the same library can coexist',
      code: `// go.mod
require (
    github.com/some/lib v1.5.0       // v1 — path has no suffix
    github.com/some/lib/v2 v2.1.0    // v2 — path has /v2 suffix
)

// In Go source, each is a separate import path:
import libv1 "github.com/some/lib"
import libv2 "github.com/some/lib/v2"

// No dependency hell — both versions compile into the same binary
// without shadowing each other.`,
    },
    { type: 'heading', text: 'replace directive — local development' },
    {
      type: 'compare',
      javaLabel: 'Java — mvn install to local .m2',
      goLabel: 'Go — replace directive',
      java: `# Build and install to local Maven repo
cd ../my-shared-lib
mvn install

# pom.xml in the depending project
<dependency>
  <groupId>com.mycompany</groupId>
  <artifactId>my-shared-lib</artifactId>
  <version>1.0-SNAPSHOT</version>
</dependency>`,
      go: `// go.mod in your project
require github.com/mycompany/shared-lib v0.0.0

// redirect to a local path — no publishing needed
replace github.com/mycompany/shared-lib => ../shared-lib

// Remove the replace directive before publishing.
// go mod tidy will warn if a replace points nowhere.`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: '`replace` is for local development only. Never publish a module to a registry with a `replace` directive pointing to a relative path — consumers cannot resolve it.',
    },
    { type: 'heading', text: 'Pinning tool dependencies (Go 1.24+)' },
    {
      type: 'prose',
      text: 'Code generators and linters used in `go generate` or CI need to be pinned to a specific version. Before Go 1.24, the idiom was a `tools.go` file with blank imports — a confusing workaround. Go 1.24 added a `tool` directive to `go.mod`.',
    },
    {
      type: 'compare',
      javaLabel: 'Java — build plugin versions',
      goLabel: 'Go 1.24+ — tool directive',
      java: `<!-- pom.xml — plugin version is pinned here -->
<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
      <version>3.2.0</version>
    </plugin>
  </plugins>
</build>`,
      go: `// go.mod — pin code-gen tools here
module github.com/mycompany/my-app

go 1.24

require (
    github.com/gin-gonic/gin v1.9.1
)

tool (
    github.com/sqlc-dev/sqlc/cmd/sqlc
    github.com/mailru/easyjson/easyjson
)

// Run pinned tools via: go tool sqlc generate
// go mod tidy keeps tool versions in sync with go.sum`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: 'Before Go 1.24, the community used a `tools.go` file with `//go:build tools` and blank imports (`_ "github.com/sqlc-dev/sqlc/cmd/sqlc"`) to force go.sum to track tool versions. You will see this pattern in older codebases.',
    },
    { type: 'heading', text: 'Private modules' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'configure GONOSUMCHECK / GOFLAGS for private repos',
      code: `# Tell Go not to fetch private modules via the public proxy
# (proxy.golang.org does not have access to your private repos)
export GONOSUMCHECK="github.com/mycompany/*"
export GOFLAGS="-mod=mod"
export GOPRIVATE="github.com/mycompany/*"

# GOPRIVATE sets both GONOSUMCHECK and GONOPROXY at once.
# Git credentials (SSH or token) handle auth — same as Maven's settings.xml`,
    },
  ],
};

export default section;

import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'tooling',
  label: 'Tooling & Deployment',
  summary:
    'One go command instead of a build tool, formatting and linting, static binaries and small containers, embedded assets, and tuning the GC instead of -Xmx.',
  blocks: [
    {
      type: 'prose',
      text: 'A Java project assembles its toolchain from parts: a JDK, Maven or Gradle, plugins for formatting, linting, coverage and packaging, and a JVM at runtime. Go puts almost all of it in one `go` command and produces a single native executable with no runtime to install.',
    },
    { type: 'heading', text: 'The go command' },
    {
      type: 'table',
      rows: [
        ['`mvn compile` / `gradle build`', '`go build ./...`'],
        ['`mvn exec:java` / `gradle run`', '`go run ./cmd/api`'],
        ['`mvn test`', '`go test ./...`'],
        ['`mvn install` (a CLI tool)', '`go install example.com/tool@latest`'],
        ['Spotless / google-java-format', '`gofmt` (and `goimports`)'],
        ['Compiler warnings + ErrorProne', '`go vet ./...`'],
        ['OpenRewrite migrations', '`go fix ./...` (modernizers, Go 1.26+)'],
        ['Javadoc', '`go doc`, and pkg.go.dev for published modules'],
        ['Annotation processors', '`go generate` + `//go:generate` comments'],
        ['OWASP dependency-check', '`govulncheck ./...`'],
      ],
    },
    {
      type: 'why',
      text: 'Because the toolchain is part of the language distribution, every Go project builds, tests and formats the same way. A new team member runs `go test ./...` on day one without reading a build script. There is also no build language to debug: `go.mod` declares dependencies and the directory structure declares everything else.',
    },
    { type: 'heading', text: 'Formatting and linting' },
    {
      type: 'list',
      items: [
        '**`gofmt` settles style.** Tabs, spacing and alignment are not configurable, so they are never debated in code review. Run it on save; `goimports` also adds and removes import lines.',
        '**`go vet`** catches real bugs: mismatched `Printf` verbs, copied mutexes, unreachable code, lost `context` cancel functions, malformed struct tags. `go test` runs a subset automatically.',
        '**staticcheck** is the most respected third-party analyser. **golangci-lint** runs it together with dozens of other linters (`errcheck`, `gosec`, `revive`, `exhaustive`) from one config file.',
        '**`go fix`** (revamped in Go 1.26) rewrites code to use newer idioms and APIs, for example replacing hand-written loops with `slices.Contains` or `interface{}` with `any`.',
        '**`govulncheck`** reports known vulnerabilities only when your code actually **calls** the affected function, which keeps the signal high.',
      ],
    },
    { type: 'heading', text: 'Building: one static binary' },
    {
      type: 'codeblock',
      lang: 'bash',
      label: 'build flags you will actually use',
      code: `# A static binary with no libc dependency (pure-Go code)
CGO_ENABLED=0 go build -o bin/api ./cmd/api

# Cross-compile: no toolchain to install for the target
GOOS=linux GOARCH=arm64 go build -o bin/api-linux-arm64 ./cmd/api
GOOS=windows GOARCH=amd64 go build -o bin/api.exe ./cmd/api

# Stamp a version at link time; strip paths for reproducible builds
go build -trimpath -ldflags "-s -w -X main.version=v1.4.2" -o bin/api ./cmd/api

# Which module versions went into a binary? (build info is embedded)
go version -m bin/api`,
    },
    {
      type: 'callout',
      title: 'What changes when there is no JVM',
      tone: 'go',
      text: '**Startup** takes milliseconds rather than seconds, with no warm-up: code is compiled ahead of time, so there is no JIT and no class loading. That makes Go a good fit for CLIs, serverless functions and fast autoscaling.\n\n**Memory** for a small service is typically tens of megabytes, not hundreds. There is no heap to pre-size and no metaspace.\n\n**Deployment** is one file. The same idea as a GraalVM native image, except it is the default and builds in seconds.',
    },
    { type: 'heading', text: 'Containers' },
    {
      type: 'codeblock',
      lang: 'dockerfile',
      label: 'a multi-stage Dockerfile for a Go service',
      code: `# ---- build stage ----
FROM golang:1.27 AS build
WORKDIR /src

# Cache dependencies separately from source changes
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o /out/api ./cmd/api

# ---- runtime stage: no shell, no package manager ----
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/api /api
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/api"]`,
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'The runtime image holds your binary plus CA certificates and time zone data, typically 10–30 MB in total, compared with a couple of hundred megabytes for a JRE image. There is no Jib or buildpack equivalent to learn: a two-stage Dockerfile is the standard.',
    },
    { type: 'heading', text: 'Embedding files in the binary' },
    {
      type: 'compare',
      javaLabel: 'Java — classpath resources',
      goLabel: 'Go — //go:embed (Go 1.16+)',
      java: `// src/main/resources/templates/welcome.html
try (InputStream in = getClass()
        .getResourceAsStream("/templates/welcome.html")) {
    String html = new String(in.readAllBytes(), UTF_8);
}`,
      go: `import "embed"

// The files are compiled into the binary at build time
//go:embed templates/*.html
var templates embed.FS

//go:embed schema.sql
var schema string

//go:embed static
var static embed.FS

html, err := templates.ReadFile("templates/welcome.html")

// embed.FS plugs into http.FileServerFS and html/template
mux.Handle("GET /static/", http.FileServerFS(static))`,
    },
    { type: 'heading', text: 'Tuning the garbage collector' },
    {
      type: 'table',
      rows: [
        [
          '`-Xmx2g`: a hard heap limit',
          '`GOMEMLIMIT=1800MiB`: a soft limit; GC works harder as it approaches',
        ],
        [
          '`-XX:+UseG1GC`, ZGC, Shenandoah…',
          'One concurrent, low-latency GC (Green Tea, the default since Go 1.26)',
        ],
        ['Dozens of GC tuning flags', '`GOGC` (default 100): heap growth before the next cycle'],
        ['`-XX:ActiveProcessorCount`', '`GOMAXPROCS`, container-aware by default since Go 1.25'],
        [
          'JIT profiling at runtime',
          'Profile-guided optimisation: commit a `default.pgo` CPU profile',
        ],
      ],
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'In a container with a memory limit, set `GOMEMLIMIT` to roughly 90% of it. Without it, the GC paces itself only by `GOGC` and can let the heap grow past the container limit, getting the pod OOM-killed. Most services need no other GC tuning.',
    },
  ],
};

export default section;

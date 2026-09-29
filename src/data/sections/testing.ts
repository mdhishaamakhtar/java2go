import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'testing',
  label: 'Testing',
  summary:
    'The built-in test runner: table-driven tests, fakes instead of Mockito, httptest, the race detector, fuzzing, testing time with synctest, and benchmarks.',
  blocks: [
    {
      type: 'prose',
      text: 'Go ships a test runner, coverage, benchmarks, fuzzing and a race detector in the toolchain itself. There is no JUnit, Surefire plugin or test framework to choose. Tests live next to the code in `_test.go` files and run with `go test ./...`.',
    },
    { type: 'heading', text: 'Writing and running tests' },
    {
      type: 'compare',
      javaLabel: 'Java — JUnit 5',
      goLabel: 'Go — the testing package',
      java: `class MessageServiceTest {
    private MessageService svc;

    @BeforeEach
    void setUp() {
        svc = new MessageService(new InMemoryStore());
    }

    @Test
    void findById_returnsMessage() {
        assertEquals("hello", svc.findById(1L).getBody());
    }

    @Test
    void findById_throwsWhenMissing() {
        assertThrows(NotFoundException.class,
            () -> svc.findById(-1L));
    }
}`,
      go: `// message_test.go, in the same package
func TestFind(t *testing.T) {
    svc := NewService(newMemStore()) // setup is just code

    msg, err := svc.Find(t.Context(), "1") // t.Context: Go 1.24+
    if err != nil {
        t.Fatalf("Find: unexpected error: %v", err)
    }
    if msg.Body != "hello" {
        t.Errorf("Body = %q, want %q", msg.Body, "hello")
    }
}

func TestFindMissing(t *testing.T) {
    svc := NewService(newMemStore())
    _, err := svc.Find(t.Context(), "nope")
    if !errors.Is(err, ErrNotFound) {
        t.Errorf("err = %v, want ErrNotFound", err)
    }
}`,
    },
    {
      type: 'list',
      items: [
        '`t.Errorf` records a failure and keeps going; `t.Fatalf` records it and stops this test. Prefer `Errorf` so one run shows every problem.',
        'The message format `Got = x, want y` is the convention: say what was called, what came back, and what was expected.',
        '`go test ./...` runs everything; `go test -run TestFind ./internal/message` runs one test; `-v` shows each test; `-count=1` bypasses the test cache.',
      ],
    },
    { type: 'heading', text: 'Table-driven tests' },
    {
      type: 'compare',
      javaLabel: 'Java — @ParameterizedTest',
      goLabel: 'Go — a slice of cases + t.Run',
      java: `@ParameterizedTest
@CsvSource({
    "positive, 1, 2, 3",
    "zeros,    0, 0, 0",
    "negative, -1, 1, 0",
})
void add(String name, int a, int b, int expected) {
    assertEquals(expected, Calculator.add(a, b));
}`,
      go: `func TestAdd(t *testing.T) {
    tests := []struct {
        name    string
        a, b    int
        want    int
    }{
        {"positive", 1, 2, 3},
        {"zeros", 0, 0, 0},
        {"negative", -1, 1, 0},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel() // subtests may run concurrently
            if got := Add(tt.a, tt.b); got != tt.want {
                t.Errorf("Add(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
            }
        })
    }
}
// go test -run 'TestAdd/zeros'`,
    },
    {
      type: 'why',
      text: 'The test table is ordinary data, so adding a case is one line, and `t.Run` gives each case its own name in the output and on the command line. The whole pattern is plain Go: no annotations, no argument providers, nothing to learn beyond the language.',
    },
    { type: 'heading', text: 'Fakes instead of mocks' },
    {
      type: 'compare',
      javaLabel: 'Java — Mockito',
      goLabel: 'Go — a small interface and a fake',
      java: `@Mock MessageStore store;
@InjectMocks MessageService svc;

@Test
void publishesMessage() {
    when(store.findById(1L)).thenReturn(new Message(1L, "hi"));

    svc.publish(1L);

    verify(store).markPublished(1L);
}`,
      go: `// The consumer's interface is small, so a fake is tiny
type fakeStore struct {
    messages  map[int64]Message
    published []int64
}

func (f *fakeStore) FindByID(_ context.Context, id int64) (Message, error) {
    m, ok := f.messages[id]
    if !ok {
        return Message{}, ErrNotFound
    }
    return m, nil
}

func (f *fakeStore) MarkPublished(_ context.Context, id int64) error {
    f.published = append(f.published, id)
    return nil
}

func TestPublish(t *testing.T) {
    store := &fakeStore{messages: map[int64]Message{1: {ID: 1}}}
    if err := NewService(store).Publish(t.Context(), 1); err != nil {
        t.Fatal(err)
    }
    if !slices.Equal(store.published, []int64{1}) {
        t.Errorf("published = %v, want [1]", store.published)
    }
}`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'Because interfaces are defined by the consumer and kept small, hand-written fakes are usually shorter than mock setup, and they test behaviour rather than call sequences. Mock generators (`gomock`, `mockery`) exist for the cases where you really need to assert interactions.',
    },
    { type: 'heading', text: 'Assertion libraries' },
    {
      type: 'compare',
      javaLabel: 'Java — JUnit / AssertJ',
      goLabel: 'Go — testify',
      java: `assertEquals("hello", msg.getBody());
assertNotNull(msg);
assertTrue(msg.isActive());
assertThat(tags).containsExactly("a", "b");`,
      go: `import (
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

require.NoError(t, err)        // require: stops the test (Fatal)
assert.Equal(t, "hello", msg.Body) // assert: records, continues (Error)
assert.True(t, msg.Active)
assert.Equal(t, []string{"a", "b"}, tags)`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: 'testify is popular but optional; the Go team’s own code uses plain `if` statements. For comparing structs, `github.com/google/go-cmp/cmp` produces readable diffs: `if diff := cmp.Diff(want, got); diff != "" { t.Errorf("mismatch (-want +got):\\n%s", diff) }`.',
    },
    { type: 'heading', text: 'Testing HTTP handlers' },
    {
      type: 'compare',
      javaLabel: 'Java — MockMvc',
      goLabel: 'Go — httptest',
      java: `@WebMvcTest(MessageController.class)
class MessageControllerTest {
    @Autowired MockMvc mvc;
    @MockBean MessageService service;

    @Test
    void getById() throws Exception {
        when(service.find("1"))
            .thenReturn(new Message("1", "hello"));
        mvc.perform(get("/api/messages/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.body").value("hello"));
    }
}`,
      go: `func TestGetMessage(t *testing.T) {
    h := &Handler{messages: fakeFinder{"1": {ID: "1", Body: "hello"}}}

    // Route through a real mux so {id} is populated
    mux := http.NewServeMux()
    mux.HandleFunc("GET /api/messages/{id}", h.Get)

    req := httptest.NewRequest(http.MethodGet, "/api/messages/1", nil)
    rec := httptest.NewRecorder()
    mux.ServeHTTP(rec, req) // no server, no network

    if rec.Code != http.StatusOK {
        t.Fatalf("status = %d, want 200", rec.Code)
    }
    var got Message
    if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
        t.Fatal(err)
    }
    if got.Body != "hello" {
        t.Errorf("body = %q, want %q", got.Body, "hello")
    }
}`,
    },
    {
      type: 'note',
      noteType: 'warn',
      text: 'Calling `h.Get(rec, req)` directly skips the router, so `r.PathValue("id")` returns an empty string. Either route through a `ServeMux` as above, or set the value yourself with `req.SetPathValue("id", "1")`. Use `httptest.NewServer` when you need a real listener, for example to test an HTTP client or TLS.',
    },
    { type: 'heading', text: 'The race detector' },
    {
      type: 'codeblock',
      lang: 'bash',
      label: 'go test -race: data races found at test time',
      code: `go test -race ./...

# The compiler instruments every memory access. When two goroutines
# touch the same memory without synchronisation, and at least one of
# them writes, the test fails with both goroutines' stack traces.
#
# Costs roughly 2-20x CPU and 5-10x memory, so it is for tests and
# staging, not production. Run it in CI on every change.`,
    },
    { type: 'heading', text: 'Testing code that uses time (Go 1.25+)' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'testing/synctest: a fake clock for concurrent code',
      code: `func TestDebounce(t *testing.T) {
    synctest.Test(t, func(t *testing.T) {
        // Inside the bubble, time is fake: it only advances when
        // every goroutine in the bubble is blocked. Sleeps are instant.
        var calls atomic.Int32
        d := NewDebouncer(time.Second, func() { calls.Add(1) })

        d.Trigger()
        time.Sleep(500 * time.Millisecond)
        d.Trigger() // restarts the 1s quiet period

        time.Sleep(999 * time.Millisecond)
        synctest.Wait() // let timers and goroutines settle
        if n := calls.Load(); n != 0 {
            t.Fatalf("calls = %d before quiet period, want 0", n)
        }

        time.Sleep(time.Millisecond)
        synctest.Wait()
        if n := calls.Load(); n != 1 {
            t.Fatalf("calls = %d, want 1", n)
        }
    })
}`,
    },
    {
      type: 'note',
      noteType: 'java',
      text: 'This replaces injecting a `java.time.Clock` or Awaitility-style polling. The test runs in milliseconds and is deterministic, and the production code uses the real `time` package unchanged.',
    },
    { type: 'heading', text: 'Fuzzing' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'built-in fuzzing (Go 1.18+)',
      code: `func FuzzSlugify(f *testing.F) {
    f.Add("Hello, World") // seed corpus
    f.Add("")
    f.Fuzz(func(t *testing.T, s string) {
        got := Slugify(s)
        if strings.HasPrefix(got, "-") || strings.HasSuffix(got, "-") {
            t.Errorf("Slugify(%q) = %q: leading or trailing dash", s, got)
        }
    })
}

// go test runs the seeds as normal tests.
// go test -fuzz=FuzzSlugify generates new inputs until it finds a
// failure, then saves it under testdata/fuzz as a regression test.`,
    },
    { type: 'heading', text: 'Benchmarks' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'b.Loop (Go 1.24+) replaces the b.N loop',
      code: `func BenchmarkSlugify(b *testing.B) {
    input := strings.Repeat("Hello, World ", 10) // setup: not timed
    for b.Loop() {
        Slugify(input)
    }
}

// go test -run '^$' -bench . -benchmem ./...
//
// BenchmarkSlugify-10   15649554   71.00 ns/op   24 B/op   1 allocs/op
//                    ^ GOMAXPROCS   ^ iterations  ^ time    ^ allocations`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: 'With `b.Loop()` the benchmark function body runs once, so setup before the loop is excluded from timing automatically, and the compiler cannot optimise away the call inside the loop. The older form, `for i := 0; i < b.N; i++`, reran the whole function several times and needed `b.ResetTimer()` after setup. Compare runs statistically with `benchstat`, the equivalent of reading JMH’s error bars.',
    },
    {
      type: 'table',
      rows: [
        ['`@Test`', '`func TestXxx(t *testing.T)`'],
        ['`@ParameterizedTest`', 'Table-driven test + `t.Run`'],
        ['`@BeforeEach` / `@AfterEach`', 'Setup code in the test; `t.Cleanup(func() { … })`'],
        ['`@BeforeAll` / `@AfterAll`', '`func TestMain(m *testing.M)`'],
        ['`@Disabled` / `assumeTrue`', '`t.Skip("reason")`'],
        ['`@Timeout`', '`go test -timeout 30s`'],
        ['`@TempDir`', '`t.TempDir()`, removed automatically'],
        ['Mockito', 'Hand-written fakes behind small interfaces'],
        ['MockMvc / WebTestClient', '`httptest.NewRecorder` / `httptest.NewServer`'],
        ['JaCoCo', '`go test -cover`, `-coverprofile`, `go tool cover -html`'],
        ['JMH', '`func BenchmarkXxx(b *testing.B)`'],
        ['jqwik / property-based tests', '`func FuzzXxx(f *testing.F)`'],
        ['(nothing built in)', '`go test -race`: the race detector'],
      ],
    },
  ],
};

export default section;

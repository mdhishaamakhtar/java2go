import type { Section } from '@/types/section';

const section: Section = {
  id: 'testing',
  title: '24',
  label: 'Testing',
  blocks: [
    {
      type: 'prose',
      text: 'Go ships a test runner, coverage tool, and benchmark harness in the standard library — no JUnit, TestNG, or Maven Surefire plugin needed. Tests live alongside production code in `_test.go` files and run with a single command.',
    },
    { type: 'heading', text: 'Writing and running tests' },
    {
      type: 'compare',
      javaLabel: 'Java — JUnit 5',
      goLabel: 'Go — testing package',
      java: `// MessageServiceTest.java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class MessageServiceTest {

    @Test
    void findById_returnsMessage() {
        var svc = new MessageService();
        var msg = svc.findById(1L);
        assertEquals("hello", msg.getBody());
    }

    @Test
    void findById_throwsWhenMissing() {
        assertThrows(NotFoundException.class,
            () -> svc.findById(-1L));
    }
}`,
      go: `// message_service_test.go — same package or package foo_test
package service

import "testing"

// Test function: name starts with Test, takes *testing.T
func TestFindByID(t *testing.T) {
    svc := NewMessageService()
    msg, err := svc.FindByID(t.Context(), "1")
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if msg.Body != "hello" {
        t.Errorf("got %q, want %q", msg.Body, "hello")
    }
}

// Run all tests: go test ./...
// Run one test:  go test -run TestFindByID ./...`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: '`t.Fatal` / `t.Fatalf` stops the current test immediately (like `fail-fast`). `t.Error` / `t.Errorf` marks the test as failed but continues running — use it when you want to see all failures at once.',
    },
    { type: 'heading', text: 'Table-driven tests — the Go idiom' },
    {
      type: 'compare',
      javaLabel: 'Java — @ParameterizedTest',
      goLabel: 'Go — table-driven test',
      java: `@ParameterizedTest
@MethodSource("additionCases")
void add(int a, int b, int expected) {
    assertEquals(expected, calculator.add(a, b));
}

static Stream<Arguments> additionCases() {
    return Stream.of(
        Arguments.of(1, 2, 3),
        Arguments.of(0, 0, 0),
        Arguments.of(-1, 1, 0)
    );
}`,
      go: `func TestAdd(t *testing.T) {
    cases := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive", 1, 2, 3},
        {"zeros", 0, 0, 0},
        {"negative", -1, 1, 0},
    }

    for _, tc := range cases {
        t.Run(tc.name, func(t *testing.T) {
            got := Add(tc.a, tc.b)
            if got != tc.expected {
                t.Errorf("Add(%d, %d) = %d, want %d",
                    tc.a, tc.b, got, tc.expected)
            }
        })
    }
}

// Run one subtest: go test -run TestAdd/zeros`,
    },
    {
      type: 'why',
      text: 'Table-driven tests are idiomatic Go — one `Test*` function with a slice of cases. `t.Run` creates a named subtest for each case, so failures show exactly which case broke. No test framework or annotation processor required.',
    },
    { type: 'heading', text: 'testify — assert and require' },
    {
      type: 'prose',
      text: '`github.com/stretchr/testify` is the most widely used testing helper. `assert` continues after failure; `require` stops immediately. It is the closest analogue to JUnit\'s `Assertions` + `Assumptions`.',
    },
    {
      type: 'compare',
      javaLabel: 'Java — JUnit 5 Assertions',
      goLabel: 'Go — testify',
      java: `import static org.junit.jupiter.api.Assertions.*;

assertEquals("hello", msg.getBody());
assertNotNull(msg);
assertTrue(msg.isActive());
assertThrows(NotFoundException.class, () -> svc.findById(-1L));`,
      go: `import (
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

// assert — marks failure, test continues
assert.Equal(t, "hello", msg.Body)
assert.NotNil(t, msg)
assert.True(t, msg.Active)

// require — marks failure, test stops (like t.Fatal)
require.NoError(t, err)       // stop immediately if err != nil
require.Equal(t, "hello", msg.Body)`,
    },
    { type: 'heading', text: 'Testing HTTP handlers with httptest' },
    {
      type: 'compare',
      javaLabel: 'Java — MockMvc',
      goLabel: 'Go — httptest.NewRecorder',
      java: `@WebMvcTest(MessageController.class)
class MessageControllerTest {

    @Autowired MockMvc mockMvc;

    @Test
    void getById() throws Exception {
        mockMvc.perform(get("/api/messages/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.body").value("hello"));
    }
}`,
      go: `func TestGetMessage(t *testing.T) {
    handler := &MessageHandler{service: &stubService{}}

    // Create a fake request and response recorder
    req := httptest.NewRequest("GET", "/api/messages/1", nil)
    w   := httptest.NewRecorder()

    // Call the handler directly — no server needed
    handler.Get(w, req)

    resp := w.Result()
    require.Equal(t, http.StatusOK, resp.StatusCode)

    var msg Message
    json.NewDecoder(resp.Body).Decode(&msg)
    assert.Equal(t, "hello", msg.Body)
}`,
    },
    {
      type: 'note',
      noteType: 'tip',
      text: '`httptest.NewServer(handler)` starts a real HTTP server on a random port — use it when you need to test middleware, TLS, or actual HTTP transport. `httptest.NewRecorder()` is faster and sufficient for testing handlers directly.',
    },
    { type: 'heading', text: 'The race detector' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'go test -race — no Java equivalent',
      code: `# Run tests with the data race detector enabled
go test -race ./...

# What it does:
# Go instruments all memory accesses at compile time.
# If two goroutines access the same variable concurrently and
# at least one write is involved — without synchronisation —
# the detector prints the goroutine stacks and fails the test.

# Cost: ~5-10x slower and uses more memory.
# Worth it: catches races that only appear under specific scheduling.

# Also available in production binaries (but only for testing):
# go build -race -o myapp-race ./cmd/myapp`,
    },
    {
      type: 'table',
      rows: [
        ['JUnit @Test', 'func TestXxx(t *testing.T)'],
        ['@ParameterizedTest + @MethodSource', 'table-driven test + t.Run'],
        ['@BeforeEach / @AfterEach', 't.Cleanup(func() { ... })'],
        ['Assertions.assertEquals', 'assert.Equal (testify)'],
        ['Assertions.assertThrows', 'require.Error + errors.Is'],
        ['MockMvc / WebTestClient', 'httptest.NewRecorder / httptest.NewServer'],
        ['JMH benchmarks', 'func BenchmarkXxx(b *testing.B)'],
        ['No Java equivalent', 'go test -race (race detector)'],
      ],
    },
    { type: 'heading', text: 'Benchmarks' },
    {
      type: 'codeblock',
      lang: 'go',
      label: 'benchmark with b.Loop() — Go 1.24+',
      code: `// Benchmark function: starts with Benchmark, takes *testing.B
func BenchmarkMarshal(b *testing.B) {
    msg := Message{ID: "1", Body: "hello world"}

    // b.Loop() — Go 1.24+ preferred form
    // Handles timer start/stop, warmup, and iteration count automatically
    for b.Loop() {
        json.Marshal(msg)
    }
}

// Run benchmarks (skipped by default):
// go test -bench=. ./...
// go test -bench=BenchmarkMarshal -benchmem ./...

// Output:
// BenchmarkMarshal-8   3_241_058   368.4 ns/op   120 B/op   3 allocs/op`,
    },
    {
      type: 'note',
      noteType: 'info',
      text: '`b.Loop()` (Go 1.24+) replaces the old `for i := 0; i < b.N; i++` pattern. It is less error-prone — the testing framework controls the iteration count internally, and you cannot accidentally perform setup inside the loop body by forgetting to call `b.ResetTimer()`.',
    },
  ],
};

export default section;

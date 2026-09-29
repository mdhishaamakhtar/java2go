import type { SectionContent } from '@/types/section';

const section: SectionContent = {
  id: 'packages',
  label: 'Packages & Imports',
  summary:
    'A package is a directory, capitalisation is the only access modifier, and there are exactly two visibility scopes.',
  blocks: [
    {
      type: 'prose',
      text: 'Every Go file begins with `package name`. All `.go` files in the same directory belong to one package, and the package name is the namespace callers use: short, lowercase, one word. There is no class wrapper: functions, types, variables and constants live directly at package level.',
    },
    { type: 'heading', text: 'Package declaration and imports' },
    {
      type: 'compare',
      javaLabel: 'Java — class per file, reverse-domain package',
      goLabel: 'Go — package per directory, short name',
      java: `// File: UserService.java
package com.mycompany.service;

import com.mycompany.model.User;
import java.util.Optional;

public class UserService {
    // A class is required: no free functions
    public Optional<User> getUser(String id) {
        return Optional.empty();
    }
}`,
      go: `// File: internal/service/user.go
package service

import (
    "errors"

    "github.com/mycompany/app/internal/model"
)

var ErrNotFound = errors.New("user not found")

// No class needed: functions live at package level
func GetUser(id string) (*model.User, error) {
    return nil, ErrNotFound
}`,
    },
    {
      type: 'why',
      text: 'Go has no classes, so the package is the unit of organisation and encapsulation. Package-level functions play the role that static methods on a utility class play in Java, except that they are the default rather than a special case.',
    },
    {
      type: 'list',
      items: [
        'The import path is the **module path plus the directory**: `github.com/mycompany/app/internal/model`. The last element is conventionally the package name, so callers write `model.User`.',
        'Standard-library imports come first, then a blank line, then everything else. `gofmt` and `goimports` maintain this for you.',
        'An **unused import is a compile error**, not a warning. So is an unused local variable.',
        'Import cycles are forbidden. If `a` imports `b`, `b` cannot import `a`. This keeps dependency graphs acyclic and builds fast, and it often forces a better package design.',
      ],
    },
    { type: 'heading', text: 'Exported vs unexported: capitalisation is the access modifier' },
    {
      type: 'compare',
      javaLabel: 'Java — keywords for visibility',
      goLabel: 'Go — first letter decides visibility',
      java: `public class User {
    public String id;          // public
    public String email;       // public
    private String password;   // private

    public static User newUser(String email) { ... }
    private String hashPw(String pw) { ... }
}`,
      go: `type User struct {
    ID       string // Uppercase: exported
    Email    string // Uppercase: exported
    password string // lowercase: package-private
}

// Exported function
func NewUser(email string) User { ... }

// Unexported function
func hashPw(pw string) string { ... }`,
    },
    {
      type: 'why',
      text: 'There are no `public`, `private` or `protected` keywords. An identifier starting with an uppercase letter is exported from its package; anything else is visible only inside the package. There is no `protected` because there is no inheritance. Two scopes, decided by one character, readable at every call site: `user.Email` is obviously public API.',
    },
    { type: 'heading', text: 'internal/: visibility at the module level' },
    {
      type: 'prose',
      text: 'Java 9 modules let you control which packages a module exports. Go has a lighter mechanism enforced by the compiler: a package under a directory named `internal` can only be imported by code rooted at the parent of that `internal` directory. Put everything that is not a deliberate public API under `internal/` and outsiders cannot depend on it.',
    },
    {
      type: 'codeblock',
      lang: 'text',
      label: 'who may import an internal package',
      code: `github.com/mycompany/app/
├── internal/
│   └── billing/        ← importable only from github.com/mycompany/app/...
├── cmd/api/main.go     ← can import app/internal/billing
└── go.mod

github.com/someone/else ← compile error: use of internal package not allowed`,
    },
    { type: 'heading', text: 'Naming conventions' },
    {
      type: 'table',
      rows: [
        [
          '`com.mycompany.handlers` package',
          '`handler`: short, lowercase, singular, no underscores',
        ],
        [
          '`UserServiceImpl`',
          'Name the concrete type after what it is: `PostgresStore`, not `StoreImpl`',
        ],
        ['`getUserId()`', '`UserID()`: no `Get` prefix on getters; acronyms stay uppercase'],
        ['`StringUtils.isBlank()`', '`strings.TrimSpace()`: the package name is part of the name'],
        ['`IReader` / `ReaderInterface`', '`Reader`: one-method interfaces end in `-er`'],
      ],
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'Avoid stutter: callers write the package name, so `http.Server` beats `http.HTTPServer` and `user.New()` beats `user.NewUser()`. Avoid meaningless package names like `util`, `common` or `helpers`; name a package after what it provides.',
    },
  ],
};

export default section;

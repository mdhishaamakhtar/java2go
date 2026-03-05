import type { Section } from '@/types/section';

const section: Section = {
  id: 'packages',
  title: '01',
  label: 'Packages & Imports',
  blocks: [
    {
      type: 'prose',
      text: 'Every Go file begins with `package name`. All files in the same directory share one package. The package name is the namespace — short, lowercase, one word.',
    },
    { type: 'heading', text: 'Package declaration and imports' },
    {
      type: 'compare',
      javaLabel: 'Java — class per file, reverse-domain package',
      goLabel: 'Go — package per folder, short name',
      java: `// File: UserService.java
package com.mycompany.service;

import com.mycompany.model.User;
import java.util.List;

public class UserService {
    // class required — cannot have free functions
}`,
      go: `// File: user_service.go
package service

import (
    "fmt"
    "github.com/mycompany/model"
)

// No class needed — functions live at package level
func GetUser(id string) (*model.User, error) {
    return nil, nil
}`,
    },
    {
      type: 'why',
      text: 'Go has no classes. The package IS the unit of organisation. Functions, types, and variables at the package level are the equivalent of static members in a Java utility class — except they are the default, not a special case.',
    },
    { type: 'heading', text: 'Exported vs Unexported — capitalisation is the access modifier' },
    {
      type: 'compare',
      javaLabel: 'Java — keywords for visibility',
      goLabel: 'Go — capitalisation for visibility',
      java: `public class User {
    public String id;          // public
    public String email;       // public
    private String password;   // private

    public User newUser(String email) { ... }
    private String hashPw(String pw) { ... }
}`,
      go: `type User struct {
    ID       string   // Capital = exported (public)
    Email    string   // Capital = exported
    password string   // lowercase = unexported (package-private)
}

// Capital = exported function
func NewUser(email string) User { ... }

// lowercase = unexported function
func hashPw(pw string) string { ... }`,
    },
    {
      type: 'why',
      text: 'No public/private/protected keywords. Capitalisation is the entire visibility system. Go has no protected — there is no inheritance. There are only two scopes: this package, or everyone.',
    },
    {
      type: 'note',
      noteType: 'tip',
      text: 'Package names: short, lowercase, single word — `handler` not `handlerService`. Types: PascalCase. Unexported functions: camelCase. Acronyms stay uppercase: `UserID` not `UserId`.',
    },
  ],
};

export default section;

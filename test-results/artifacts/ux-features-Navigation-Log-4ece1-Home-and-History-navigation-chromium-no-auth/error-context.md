# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Welcome to Rangkai" [level=1] [ref=e6]
      - paragraph [ref=e7]: Sign in to manage your book catalog
    - button "Continue with Google" [ref=e9] [cursor=pointer]:
      - img [ref=e10]
      - generic [ref=e15]: Continue with Google
    - paragraph [ref=e16]: By continuing, you verify that you are an authorized user of this library.
  - generic:
    - img
  - generic:
    - generic:
      - generic:
        - button "Go to parent" [disabled]
        - button "Open in editor"
        - button "Close"
  - generic [ref=e17]:
    - button "Toggle Nuxt DevTools" [ref=e18] [cursor=pointer]:
      - img [ref=e19]
    - generic "Page load time" [ref=e22]:
      - generic [ref=e23]: "-"
    - button "Toggle Component Inspector" [ref=e25] [cursor=pointer]:
      - img [ref=e26]
```
# Trafficker

## Quick start

```json
{
  "gateway": {
    "port": 3000
  },
  "proxy": {
    "route": "*",
    "gatewayAddress": "http://localhost:3000",
    "targetAddress": "http://localhost:8080"
  }
}
```

```bash
yarn start config.json
```

## License

MIT

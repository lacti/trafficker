# Trafficker

## Quick start

```json
{
  "gateway": [
    {
      "port": 3000,
      "defaultWaitingTimeout": 6000,
      "defaultWaiterTimeout": 30000
    }
  ],
  "proxy": [
    {
      "route": "*",
      "gatewayAddress": "http://localhost:3000",
      "targetAddress": "http://localhost:8080",
      "agentCount": 4,
      "errorSleepMillis": {
        "min": 1000,
        "max": 2000
      },
      "emptySleepMillis": {
        "min": 1000,
        "max": 5000
      }
    }
  ]
}
```

```bash
yarn start config.json
```

## License

MIT

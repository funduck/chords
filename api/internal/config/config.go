package config

type Config struct {
	Port                        string            `mapstructure:"API_PORT"`
	SQLiteFile                  string            `mapstructure:"SQLITE_FILE"`
	Secret                      string            `mapstructure:"API_SECRET"`
	AccessTokenExpiresInSeconds int64             `mapstructure:"ACCESS_TOKEN_EXPIRES_IN_SECONDS"`
	LoggerEnv                   string            `mapstructure:"LOGGER_ENV"`
	LoggerLevel                 string            `mapstructure:"LOGGER_LEVEL"`
	LoggerLevels                map[string]string `mapstructure:"LOGGER_LEVELS"`
}

var config *Config

func New() *Config {
	if config != nil {
		return config
	}
	config = &Config{}
	if err := Unmarshal(config); err != nil {
		panic(err)
	}
	return config
}

func InitForTest() *Config {
	if config != nil {
		return config
	}
	config = &Config{
		Port:                        "8080",
		SQLiteFile:                  ":memory:",
		Secret:                      "test_secret",
		AccessTokenExpiresInSeconds: 3600,
		LoggerEnv:                   "test",
		LoggerLevel:                 "debug",
		LoggerLevels:                map[string]string{},
	}
	return config
}

package config

type Config struct {
	Port                        string            `mapstructure:"port"`
	SQLiteFile                  string            `mapstructure:"sqlite_file"`
	Secret                      string            `mapstructure:"secret"`
	AccessTokenExpiresInSeconds int64             `mapstructure:"access_token_expires_in_seconds"`
	LoggerEnv                   string            `mapstructure:"logger_env"`
	LoggerLevel                 string            `mapstructure:"logger_level"`
	LoggerLevels                map[string]string `mapstructure:"logger_levels"`
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

	// fmt.Printf("Loaded config: %+v\n", config)
	return config
}

func InitForTest() *Config {
	if config != nil {
		return config
	}
	config = &Config{
		Port:                        "8080",
		SQLiteFile:                  "file::memory:",
		Secret:                      "test_secret",
		AccessTokenExpiresInSeconds: 3600,
		LoggerEnv:                   "test",
		LoggerLevel:                 "error",
		LoggerLevels: map[string]string{
			"db": "info",
		},
	}
	return config
}

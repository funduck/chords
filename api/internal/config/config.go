package config

type Config struct {
	Port         string            `mapstructure:"API_PORT"`
	SQLiteFile   string            `mapstructure:"SQLITE_FILE"`
	LoggerEnv    string            `mapstructure:"LOGGER_ENV"`
	LoggerLevel  string            `mapstructure:"LOGGER_LEVEL"`
	LoggerLevels map[string]string `mapstructure:"LOGGER_LEVELS"`
}

func New() *Config {
	c := &Config{}
	if err := Unmarshal(c); err != nil {
		panic(err)
	}
	return c
}

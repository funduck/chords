package config

type Config struct {
	Port         string            `mapstructure:"API_PORT"`
	LoggerEnv    string            `mapstructure:"LOGGER_ENV"`
	LoggerLevel  string            `mapstructure:"LOGGER_LEVEL"`
	LoggerLevels map[string]string `mapstructure:"LOGGER_LEVEL"`
}

func New() *Config {
	c := &Config{}
	if err := Unmarshal(c); err != nil {
		panic(err)
	}
	return c
}

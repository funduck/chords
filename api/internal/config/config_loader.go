package config

import (
	"fmt"

	"github.com/spf13/viper"
)

var runtime_viper *viper.Viper

func Init() {
	if runtime_viper != nil {
		return
	}
	runtime_viper = viper.New()
	runtime_viper.SetConfigName("api") // name of config file (without extension)
	runtime_viper.SetConfigType("env") // or "json", "toml", etc.
	runtime_viper.AddConfigPath(".")   // path to look for the config file in
	if err := runtime_viper.ReadInConfig(); err != nil {
		panic(fmt.Errorf("fatal error config file: %w", err))
	}
	runtime_viper.AutomaticEnv() // read in environment variables that match
}

func Unmarshal(config interface{}) error {
	Init()
	if runtime_viper == nil {
		return fmt.Errorf("runtime_viper is not initialized, call Init() first")
	}
	return runtime_viper.Unmarshal(config)
}

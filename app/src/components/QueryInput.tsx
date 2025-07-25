import { CloseButton, Combobox, TextInput, useCombobox } from "@mantine/core";
import { useEffect, useState } from "react";

interface QueryInputProps {
  name: string;
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  enableHistory?: boolean;
}

function QueryInput({ name, query, onQueryChange, onSubmit, placeholder, enableHistory }: QueryInputProps) {
  const storageKey = `${name}-history`;

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const combobox = useCombobox();

  // Save search to history
  const saveToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const updatedHistory = [searchQuery, ...searchHistory.filter((item) => item !== searchQuery)].slice(0, 10);
    setSearchHistory(updatedHistory);
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
  };

  const removeFromHistory = (searchQuery: string) => {
    if (!searchHistory) return;

    const updatedHistory = searchHistory.filter((item) => item !== searchQuery);
    setSearchHistory(updatedHistory);
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
  };

  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(storageKey);
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Expose saveToHistory and removeFromHistory methods to parent
  useEffect(() => {
    // Store methods on the component instance for parent access
    (QueryInput as any).saveToHistory = saveToHistory;
    (QueryInput as any).removeFromHistory = removeFromHistory;
  }, [searchHistory]);

  const shouldFilterOptions = !searchHistory.some((item) => item === query);
  const filteredOptions = shouldFilterOptions
    ? searchHistory.filter((item) => item.toLowerCase().includes(query.toLowerCase().trim()))
    : searchHistory;
  const searchHistoryOptions = filteredOptions.map((item) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ));

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        onQueryChange(optionValue);
        combobox.closeDropdown();
        onSubmit();
      }}
      store={combobox}
      withinPortal={false}
    >
      <Combobox.Target>
        <TextInput
          name={name}
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            onQueryChange(event.currentTarget.value);
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmit();
            }
          }}
          rightSection={
            <CloseButton
              aria-label="Clear input"
              onClick={() => onQueryChange("")}
              style={{ display: query ? undefined : "none" }}
            />
          }
        />
      </Combobox.Target>

      {enableHistory && searchHistoryOptions.length > 0 && (
        <Combobox.Dropdown>
          <Combobox.Options>{searchHistoryOptions}</Combobox.Options>
        </Combobox.Dropdown>
      )}
    </Combobox>
  );
}

export default QueryInput;

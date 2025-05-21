import { Tag } from "node_modules/react-tag-input/types/components/SingleTag";
import { useState } from "react";
import { SEPARATORS, WithContext } from "react-tag-input";

export default function EditableTags(params: { tags: Tag[]; setTags: (tags: Tag[]) => void; suggestions: Array<Tag> }) {
  const [tags, setTags] = useState<Array<Tag>>(params.tags);

  const handleDelete = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    params.setTags(newTags);
  };

  const onTagUpdate = (index: number, newTag: Tag) => {
    const updatedTags = [...tags];
    updatedTags.splice(index, 1, newTag);
    setTags(updatedTags);
    params.setTags(updatedTags);
  };

  const handleAddition = (tag: Tag) => {
    const newTags = [...tags, tag];
    setTags(newTags);
    params.setTags(newTags);
  };

  const handleDrag = (tag: Tag, currPos: number, newPos: number) => {
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    setTags(newTags);
    params.setTags(newTags);
  };

  const handleTagClick = (index: number) => {
    console.log("The tag at index " + index + " was clicked");
  };

  const onClearAll = () => {
    setTags([]);
    params.setTags([]);
  };

  return (
    <WithContext
      autocomplete={true}
      clearAll
      editable
      handleAddition={handleAddition}
      handleDelete={handleDelete}
      handleDrag={handleDrag}
      handleTagClick={handleTagClick}
      inline={true}
      inputFieldPosition="bottom"
      maxTags={7}
      onClearAll={onClearAll}
      onTagUpdate={onTagUpdate}
      separators={[SEPARATORS.ENTER, SEPARATORS.COMMA]}
      shouldRenderSuggestions={(query) => query.length > 0}
      suggestions={params.suggestions}
      tags={tags}
    />
  );
}

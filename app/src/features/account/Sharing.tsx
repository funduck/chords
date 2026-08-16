import { ActionIcon, Button, CopyButton, Group, Stack, Text, TextInput, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy, IconPlus, IconTrash } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import { ChordsComApiInternalDtoShareLinkInfo } from "@generated/api";

import { RoutesEnum } from "@src/Router";
import { useSharesApi } from "@src/hooks/Api";

type ShareLink = ChordsComApiInternalDtoShareLinkInfo;

function shareUrl(code: string): string {
  return `${window.location.origin}${RoutesEnum.Share(code)}`;
}

function Sharing() {
  const sharesApi = useSharesApi();
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [busy, setBusy] = useState(false);

  const loadLinks = useCallback(() => {
    return sharesApi?.listShareLinks().then(setLinks);
  }, [sharesApi]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const createLink = async () => {
    if (!sharesApi) return;
    setBusy(true);
    try {
      await sharesApi.createShareLink();
      await loadLinks();
    } finally {
      setBusy(false);
    }
  };

  const revokeLink = async (id: number) => {
    if (!sharesApi) return;
    await sharesApi.revokeShareLink({ id });
    await loadLinks();
  };

  return (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        Create a link to let others browse your library. Anyone with the link can view your songs and artists.
      </Text>

      {links.length > 0 && (
        <Stack gap="xs">
          {links.map((link) => (
            <Group key={link.id} gap="xs" wrap="nowrap">
              <TextInput readOnly value={shareUrl(link.code!)} size="xs" style={{ flex: 1 }} />
              <CopyButton value={shareUrl(link.code!)}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "Copied" : "Copy link"} withArrow>
                    <ActionIcon variant="subtle" color={copied ? "teal" : "gray"} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
              <Tooltip label="Revoke link" withArrow>
                <ActionIcon variant="subtle" color="red" onClick={() => revokeLink(link.id!)}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          ))}
        </Stack>
      )}

      <Button
        variant="outline"
        leftSection={<IconPlus size={16} />}
        onClick={createLink}
        loading={busy}
        disabled={!sharesApi}
      >
        Create link
      </Button>
    </Stack>
  );
}

export default Sharing;

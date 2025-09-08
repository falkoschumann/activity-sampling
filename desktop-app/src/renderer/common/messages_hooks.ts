// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";
import { CommandStatus } from "../../shared/common/messages";

export function useCommandHandler<Command>({
  handler,
}: {
  handler: (command: Command) => Promise<CommandStatus>;
}): [(command: Command) => void, CommandStatus, boolean] {
  const [command, setCommand] = useState<Command>();
  const [status, setStatus] = useState(CommandStatus.success());
  const [isPending, setPending] = useState(false);

  useEffect(() => {
    void (async function () {
      if (command == null) {
        return;
      }

      setPending(true);
      const status = await handler(command);
      setStatus(status);
      setPending(false);
    })();
  }, [handler, command]);

  return [setCommand, status, isPending];
}

export function useQueryHandler<Query, QueryResult>({
  handler,
  initialQuery,
  initialResult,
}: {
  handler: (query: Query) => Promise<QueryResult>;
  initialQuery: Query;
  initialResult: QueryResult;
}): [(query: Query) => void, QueryResult, boolean] {
  const [query, setQuery] = useState<Query>(initialQuery);
  const [result, setResult] = useState<QueryResult>(initialResult);
  const [isPending, setPending] = useState(false);

  useEffect(() => {
    void (async function () {
      setPending(true);
      const result = await handler(query);
      setResult(result);
      setPending(false);
    })();
  }, [handler, query]);

  return [setQuery, result, isPending];
}

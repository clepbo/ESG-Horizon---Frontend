"use client";

import { Fragment, useState } from "react";
import Checkbox from "../../components/Checkbox";
import { permissionMatrix } from "../_fixtures/permissionMatrix";
import type { RoleKey } from "../_fixtures/roles";

const ROLE_COLUMNS: RoleKey[] = ["Super Admin", "Sub Admin", "Data Officer", "Viewer"];

type MatrixState = Record<string, Record<RoleKey, boolean>>;

function buildInitialState(): MatrixState {
  const state: MatrixState = {};
  permissionMatrix.forEach((group) => {
    group.permissions.forEach((p) => {
      state[p.key] = { ...p.grants };
    });
  });
  return state;
}

export default function PermissionMatrixTab() {
  const initial = buildInitialState();
  const [state, setState] = useState<MatrixState>(initial);
  const [dirty, setDirty] = useState(false);

  const toggle = (permissionKey: string, role: RoleKey) => {
    setDirty(true);
    setState((prev) => ({
      ...prev,
      [permissionKey]: { ...prev[permissionKey], [role]: !prev[permissionKey][role] },
    }));
  };

  const handleReset = () => {
    setState(buildInitialState());
    setDirty(false);
  };

  const handleSave = () => {
    // TODO: wire real mutation
    setDirty(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">Permission Matrix</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={!dirty}
            className="h-9 px-4 text-sm text-gray-800 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty}
            className="h-9 px-4 text-sm text-white bg-[#119B95] hover:bg-[#0f877f] rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="text-[11px] font-semibold tracking-wider text-gray-600 uppercase border-b border-gray-100">
              <th className="text-left px-5 py-3">Permission</th>
              {ROLE_COLUMNS.map((r) => (
                <th key={r} className="text-center px-5 py-3">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionMatrix.map((group) => (
              <Fragment key={group.label}>
                <tr className="bg-gray-50">
                  <td
                    colSpan={ROLE_COLUMNS.length + 1}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-900"
                  >
                    {group.label}
                  </td>
                </tr>
                {group.permissions.map((p) => (
                  <tr key={p.key} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-5 py-3 text-sm text-gray-800">{p.label}</td>
                    {ROLE_COLUMNS.map((r) => (
                      <td key={r} className="px-5 py-3 text-center">
                        <div className="inline-flex">
                          <Checkbox
                            checked={state[p.key]?.[r] ?? false}
                            onChange={() => toggle(p.key, r)}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

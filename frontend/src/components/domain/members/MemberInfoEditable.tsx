"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { StatusPill } from "@/components/ui/status-pill";
import { formatDate } from "@/lib/date";
import { getBranches } from "@/lib/mock-data/branding";
import { updateMember, type MemberView } from "@/lib/mock-data/members";

export function MemberInfoEditable({ member }: { member: MemberView }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [mobile, setMobile] = useState(member.mobile);
  const [gender, setGender] = useState(member.gender ?? "");
  const [branchId, setBranchId] = useState(member.branch_id);

  const queryClient = useQueryClient();
  const { data: branches } = useQuery({ queryKey: ["branches"], queryFn: getBranches });

  const mutation = useMutation({
    mutationFn: () => updateMember(member.id, { name, mobile, gender: gender || null, branch_id: branchId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member", member.id] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member details updated");
      setEditing(false);
    },
  });

  function cancel() {
    setName(member.name);
    setMobile(member.mobile);
    setGender(member.gender ?? "");
    setBranchId(member.branch_id);
    setEditing(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {member.name}
          <StatusPill status={member.computedStatus} />
        </CardTitle>
        <CardAction>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil />
              Edit
            </Button>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        {editing ? (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="edit-name">Full Name</FieldLabel>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-mobile">Mobile</FieldLabel>
              <Input id="edit-mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-gender">Gender</FieldLabel>
              <Input id="edit-gender" value={gender} onChange={(e) => setGender(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-branch">Branch</FieldLabel>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger id="edit-branch" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="flex gap-2">
              <Button size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
                {mutation.isPending && <Spinner />}
                Save
              </Button>
              <Button size="sm" variant="ghost" disabled={mutation.isPending} onClick={cancel}>
                Cancel
              </Button>
            </div>
          </FieldGroup>
        ) : (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Mobile</dt>
              <dd>{member.mobile}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Gender</dt>
              <dd>{member.gender ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Branch</dt>
              <dd>{member.branch.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Joined</dt>
              <dd>{formatDate(member.join_date)}</dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}

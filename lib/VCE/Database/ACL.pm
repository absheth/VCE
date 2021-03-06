package VCE::Database::ACL;

use strict;
use warnings;
use Exporter;

our @ISA = qw( Exporter );
our @EXPORT = qw( add_acl get_acls modify_acl delete_acl);


=head2 add_acl

=cut
sub add_acl {
    my ( $self, $workgroup_id, $interface_id, $low, $high ) = @_;

    $self->{log}->debug("add_acl($workgroup_id, $interface_id, $low, $high)");

    eval {
        my $q = $self->{conn}->prepare(
            "insert into acl
            (interface_id, workgroup_id, low, high)
            values (?, ?, ?, ?)"
        );
        $q->execute($interface_id, $workgroup_id, $low, $high);

    };


    if ($@) {
        return (undef,"$@");
    }

    return ($self->{conn}->last_insert_id("", "", "acl", ""), undef);
}

=head2 get_acls

=cut
sub get_acls {
    my $self = shift;
    my %params = @_;

    $self->{log}->debug("get_acls( )");

    my $keys = [];
    my $args = [];

    if (defined $params{workgroup_id}) {
        push @$keys, 'acl.workgroup_id=?';
        push @$args, $params{workgroup_id};
    }
    if (defined $params{interface_id}) {
        push @$keys, 'acl.interface_id=?';
        push @$args, $params{interface_id};
    }

    my $values = join(' AND ', @$keys);
    my $where = scalar(@$keys) > 0 ? "WHERE $values" : "";

    my $q = $self->{conn}->prepare(
        "select acl.*, workgroup.name as workgroup_name, workgroup.id as workgroup_id from acl
         join workgroup on workgroup.id=acl.workgroup_id
         $where
         order by acl.low asc"
    );
    $q->execute(@$args);

    my $result = $q->fetchall_arrayref({});
    return $result;
}

=head2 modify_acl

=cut
sub modify_acl {
    my $self   = shift;
    my %params = @_;
    if (!defined $params{id}) {
        $self->{log}->error("ACL ID not specified");
        return 0;
    }

    $self->{log}->debug("modify_acl($params{id}, ...)");

    my $keys = [];
    my $args = [];

    if (defined $params{low}) {
        push @$keys, 'low=?';
        push @$args, $params{low};
    }
    if (defined $params{high}) {
        push @$keys, 'high=?';
        push @$args, $params{high};
    }
    if (defined $params{workgroup_id}) {
        push @$keys, 'workgroup_id=?';
        push @$args, $params{workgroup_id};
    }

    my $values = join(', ', @$keys);
    push @$args, $params{id};
    my $result;
    eval {
        my $q = $self->{conn}->prepare(
            "update acl set $values where id=?"
        );

        $result = $q->execute(@$args);
    };
    if ($@) {
        $self->{log}->error("$@");
        return 0;
    }
    return $result;
}

=head2 delete_acl

=cut
sub delete_acl {
    my $self = shift;
    my $acl_id = shift;


    if (!defined $acl_id) {
        $self->{log}->error("ACL ID not specified");
        return 0;
    }

    $self->{log}->debug("Calling delete_acl");

    my $result;
    eval {
        my $query = $self->{conn}->prepare(
            'delete from acl where id=?'
        );
       $result = $query->execute($acl_id);
    };
    if ($@) {
        $self->{log}->error("$@");
        return 0;
    }

    return $result;
}
return 1;

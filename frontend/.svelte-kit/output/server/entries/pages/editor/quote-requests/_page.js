import { redirect } from "@sveltejs/kit";
function load() {
  throw redirect(302, "/enquiries");
}
export {
  load
};
